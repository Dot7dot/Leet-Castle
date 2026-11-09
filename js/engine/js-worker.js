/*
 * JavaScript sandbox worker body.
 * Runs user code in a Web Worker after instrumenting it with acorn so that we can
 *   - count "operations" (loop iterations, function calls, cost of built-ins)  -> time complexity
 *   - estimate live auxiliary memory + recursion depth                         -> space complexity
 * The function below is serialised with toString() into a Blob worker; it expects the
 * globals `acorn` and `__S` (shared helpers) to be defined before it runs.
 */
(function (root) {
  function __lcJsWorker() {
    'use strict';
    const BUDGET_ERR = { __budget: true };

    /* ------------------------------------------------------------------ *
     *  Source instrumentation                                             *
     * ------------------------------------------------------------------ */
    function instrument(src) {
      const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'script', preserveParens: true, locations: true });
      const edits = [];
      let site = 0;
      // phase: 0 = close, 1 = replace, 2 = open (order of application at the same position)
      const open = (pos, text, depth) => edits.push({ pos, end: pos, text, phase: 2, key: depth });
      const close = (pos, text, depth) => edits.push({ pos, end: pos, text, phase: 0, key: -depth });
      const repl = (start, end, text) => edits.push({ pos: start, end, text, phase: 1, key: 0 });

      function wrap(node, depth) {
        const id = ++site;
        open(node.start, '__al(' + id + ',', depth);
        close(node.end, ')', depth);
      }

      function visit(node, parent, depth, inChain) {
        if (!node || typeof node.type !== 'string') return;
        const d = depth;
        switch (node.type) {
          case 'FunctionDeclaration':
          case 'FunctionExpression':
          case 'ArrowFunctionExpression': {
            const b = node.body;
            if (b.type === 'BlockStatement') {
              open(b.start + 1, '__en();try{', d);
              close(b.end - 1, '}finally{__ex();}', d);
            } else {
              open(b.start, '{__en();try{return (', d);
              close(b.end, ');}finally{__ex();}}', d);
            }
            break;
          }
          case 'ForStatement': case 'ForInStatement': case 'ForOfStatement':
          case 'WhileStatement': case 'DoWhileStatement': {
            const b = node.body;
            if (b.type === 'BlockStatement') open(b.start + 1, '__tk();', d);
            else { open(b.start, '{__tk();', d); close(b.end, '}', d); }
            break;
          }
          case 'ArrayExpression': case 'ObjectExpression': case 'NewExpression':
            wrap(node, d);
            break;
          case 'CallExpression':
            if (node.callee.type !== 'Super' && !inChain && !node.optional) wrap(node, d);
            break;
          case 'AssignmentExpression': {
            const L = node.left;
            if (node.operator === '=' && L.type === 'MemberExpression' && L.object.type !== 'Super' &&
                L.property.type !== 'PrivateIdentifier' && !L.optional) {
              open(L.start, '__st(', d);
              repl(L.object.end, L.property.start, ',');
              if (!L.computed) repl(L.property.start, L.property.end, JSON.stringify(L.property.name));
              repl(L.property.end, node.right.start, ',');
              close(node.right.end, ')', d);
            }
            break;
          }
        }
        const chain = inChain || node.type === 'ChainExpression';
        for (const k in node) {
          if (k === 'type' || k === 'start' || k === 'end' || k === 'loc') continue;
          const v = node[k];
          if (Array.isArray(v)) { for (const c of v) if (c && typeof c.type === 'string') visit(c, node, depth + 1, chain); }
          else if (v && typeof v.type === 'string') visit(v, node, depth + 1, chain);
        }
      }
      visit(ast, null, 0, false);
      edits.sort((a, b) => a.pos - b.pos || a.phase - b.phase || a.key - b.key);
      // keep tokens apart: `return[a]` must become `return __al(1,[a])`, not `return__al(...)`
      const idc = /[A-Za-z0-9_$\u0080-\uffff]/;
      let out = '', cur = 0;
      for (const e of edits) {
        if (e.pos < cur) continue; // should not happen
        out += src.slice(cur, e.pos);
        let t = e.text;
        if (t && idc.test(t[0]) && out && idc.test(out[out.length - 1])) t = ' ' + t;
        const nextSrc = src[e.phase === 1 ? e.end : e.pos];
        if (t && nextSrc && idc.test(t[t.length - 1]) && idc.test(nextSrc)) t = t + ' ';
        out += t;
        cur = e.phase === 1 ? e.end : e.pos;
      }
      out += src.slice(cur);
      return out;
    }

    /* ------------------------------------------------------------------ *
     *  Runtime counters                                                   *
     * ------------------------------------------------------------------ */
    let OPS = 0, BUDGET = Infinity, DEPTH = 0, MAXDEPTH = 0, ACTIVE = false, LIVE = 0, PEAK = 0;
    let counted = new WeakMap();   // obj -> counted size (>=0) or -1 when "dead"
    let retained = new WeakSet();
    let inputs = new WeakSet();
    let siteLatest = new Map();    // site*4096+depth -> obj | number (string length)
    const mapSet = Map.prototype.set; // captured before patching (internal bookkeeping must not be counted)

    function reset(budget) {
      OPS = 0; BUDGET = budget; DEPTH = 0; MAXDEPTH = 0; LIVE = 0; PEAK = 0;
      counted = new WeakMap(); retained = new WeakSet(); inputs = new WeakSet(); siteLatest = new Map();
    }
    const cost = (k) => { OPS += k; if (OPS > BUDGET) throw BUDGET_ERR; };
    const grow = (k) => { LIVE += k; if (LIVE > PEAK) PEAK = LIVE; };
    function sizeOf(o) {
      if (Array.isArray(o) || ArrayBuffer.isView(o)) return o.length;
      if (o instanceof Map || o instanceof Set) return o.size;
      let n = 0; for (const k in o) { if (Object.prototype.hasOwnProperty.call(o, k)) n++; if (n > 1e6) break; }
      return Math.max(1, n);
    }
    function ret(v) {
      if (!v || typeof v !== 'object') return;
      const c = counted.get(v);
      if (c === undefined) return;
      if (c === -1) { const s = sizeOf(v); counted.set(v, s); grow(s); }
      retained.add(v);
    }
    function trackedAdd(o, k) { const c = counted.get(o); if (c !== undefined && c >= 0) { counted.set(o, c + k); grow(k); } }
    function trackedSub(o, k) { const c = counted.get(o); if (c !== undefined && c >= 0) { const r = Math.min(c, k); counted.set(o, c - r); LIVE -= r; } }

    function __tk() { if (++OPS > BUDGET) throw BUDGET_ERR; }
    function __en() { if (++OPS > BUDGET) throw BUDGET_ERR; if (++DEPTH > MAXDEPTH) MAXDEPTH = DEPTH; }
    function __ex() { DEPTH--; }
    function __al(id, v) {
      if (!ACTIVE) return v;
      const key = id * 4096 + (DEPTH > 4095 ? 4095 : DEPTH);
      if (typeof v === 'string') {
        const prev = siteLatest.get(key);
        if (typeof prev === 'number') LIVE -= prev;
        else if (prev && !retained.has(prev)) { const c = counted.get(prev); if (c > 0) LIVE -= c; counted.set(prev, -1); }
        mapSet.call(siteLatest, key, v.length); grow(v.length); cost(v.length >> 2);
        return v;
      }
      if (v === null || typeof v !== 'object') return v;
      if (counted.has(v) || inputs.has(v)) return v;
      const sz = sizeOf(v);
      cost(sz);
      const prev = siteLatest.get(key);
      if (typeof prev === 'number') LIVE -= prev;
      else if (prev && !retained.has(prev)) { const c = counted.get(prev); if (c > 0) LIVE -= c; counted.set(prev, -1); }
      counted.set(v, sz); mapSet.call(siteLatest, key, v); grow(sz);
      if (Array.isArray(v)) { for (let i = 0; i < v.length; i++) { const x = v[i]; if (x && typeof x === 'object') ret(x); } }
      else if (v instanceof Map) { for (const x of v.values()) if (x && typeof x === 'object') ret(x); }
      else if (!(v instanceof Set) && !ArrayBuffer.isView(v)) { for (const k in v) { const x = v[k]; if (x && typeof x === 'object') ret(x); } }
      return v;
    }
    function __st(o, k, v) {
      if (ACTIVE && o && typeof o === 'object') {
        const c = counted.get(o);
        if (c !== undefined && c >= 0) {
          if (Array.isArray(o)) {
            if (k === 'length') { const nl = +v; if (nl < o.length) trackedSub(o, o.length - nl); }
            else { const idx = typeof k === 'number' ? k : +k; if (idx >= o.length) { trackedAdd(o, idx + 1 - o.length); cost(idx + 1 - o.length); } }
          } else if (!(o instanceof Map) && !(o instanceof Set) && !Object.prototype.hasOwnProperty.call(o, k)) trackedAdd(o, 1);
        }
        if (v && typeof v === 'object') ret(v);
      }
      o[k] = v;
      return v;
    }

    /* Patch built-ins so that their hidden cost is counted while ACTIVE. */
    const AP = Array.prototype, SP = String.prototype, MP = Map.prototype, STP = Set.prototype;
    const log2 = (n) => (n > 1 ? Math.ceil(Math.log2(n)) : 1);
    function patch(proto, name, fn) {
      const orig = proto[name];
      if (typeof orig !== 'function') return;
      Object.defineProperty(proto, name, {
        value: function (...a) { if (ACTIVE) return fn.call(this, orig, a); return orig.apply(this, a); },
        writable: true, configurable: true,
      });
    }
    patch(AP, 'push', function (o, a) { cost(a.length); trackedAdd(this, a.length); for (const x of a) if (x && typeof x === 'object') ret(x); return o.apply(this, a); });
    patch(AP, 'pop', function (o, a) { cost(1); if (this.length) trackedSub(this, 1); return o.apply(this, a); });
    patch(AP, 'shift', function (o, a) { cost(this.length); if (this.length) trackedSub(this, 1); return o.apply(this, a); });
    patch(AP, 'unshift', function (o, a) { cost(this.length + a.length); trackedAdd(this, a.length); for (const x of a) if (x && typeof x === 'object') ret(x); return o.apply(this, a); });
    patch(AP, 'splice', function (o, a) {
      cost(this.length);
      const before = this.length; const r = o.apply(this, a); const after = this.length;
      if (after > before) trackedAdd(this, after - before); else if (before > after) trackedSub(this, before - after);
      for (let i = 2; i < a.length; i++) if (a[i] && typeof a[i] === 'object') ret(a[i]);
      return r;
    });
    patch(AP, 'sort', function (o, a) { cost(this.length * log2(this.length)); return o.apply(this, a); });
    for (const m of ['reverse', 'fill', 'indexOf', 'lastIndexOf', 'includes', 'join', 'slice', 'concat', 'map', 'filter',
      'forEach', 'reduce', 'reduceRight', 'some', 'every', 'find', 'findIndex', 'findLast', 'findLastIndex', 'flat', 'flatMap',
      'keys', 'values', 'entries', 'toSorted', 'toReversed', 'with']) {
      patch(AP, m, function (o, a) { cost(m === 'toSorted' ? this.length * log2(this.length) : this.length); return o.apply(this, a); });
    }
    for (const m of ['indexOf', 'lastIndexOf', 'includes', 'startsWith', 'endsWith', 'search', 'match', 'replace', 'replaceAll',
      'split', 'toLowerCase', 'toUpperCase', 'trim', 'repeat', 'padStart', 'padEnd', 'localeCompare']) {
      patch(SP, m, function (o, a) { cost(this.length >> 2); return o.apply(this, a); });
    }
    patch(MP, 'set', function (o, a) { cost(1); if (!this.has(a[0])) trackedAdd(this, 1); if (a[1] && typeof a[1] === 'object') ret(a[1]); if (a[0] && typeof a[0] === 'object') ret(a[0]); return o.apply(this, a); });
    patch(MP, 'delete', function (o, a) { cost(1); if (this.has(a[0])) trackedSub(this, 1); return o.apply(this, a); });
    patch(MP, 'clear', function (o, a) { cost(this.size); trackedSub(this, this.size); return o.apply(this, a); });
    patch(STP, 'add', function (o, a) { cost(1); if (!this.has(a[0])) trackedAdd(this, 1); if (a[0] && typeof a[0] === 'object') ret(a[0]); return o.apply(this, a); });
    patch(STP, 'delete', function (o, a) { cost(1); if (this.has(a[0])) trackedSub(this, 1); return o.apply(this, a); });
    patch(STP, 'clear', function (o, a) { cost(this.size); trackedSub(this, this.size); return o.apply(this, a); });
    const AF = Array.from;
    Array.from = function (...a) { if (ACTIVE && a[0] && a[0].length !== undefined) cost(+a[0].length || 0); return AF.apply(Array, a); };
    for (const m of ['max', 'min']) { const o = Math[m]; Math[m] = function (...a) { if (ACTIVE) cost(a.length); return o.apply(Math, a); }; }

    /* A small priority queue that JS players can use (LeetCode-like convenience). */
    class PriorityQueue {
      constructor(compare) { this._h = []; this._c = compare || ((a, b) => a - b); }
      size() { return this._h.length; }
      isEmpty() { return this._h.length === 0; }
      peek() { return this._h[0]; }
      front() { return this._h[0]; }
      push(v) {
        const h = this._h; if (ACTIVE) { cost(log2(h.length + 1)); trackedAdd(this, 1); ret(v); }
        h[h.length] = v; let i = h.length - 1;
        while (i > 0) { const p = (i - 1) >> 1; if (this._c(h[i], h[p]) < 0) { const t = h[i]; h[i] = h[p]; h[p] = t; i = p; } else break; }
        return this;
      }
      enqueue(v) { return this.push(v); }
      pop() {
        const h = this._h; if (!h.length) return undefined; if (ACTIVE) { cost(log2(h.length)); trackedSub(this, 1); }
        const top = h[0]; const last = h[h.length - 1]; h.length = h.length - 1;
        if (h.length) {
          h[0] = last; let i = 0;
          while (true) {
            const l = 2 * i + 1, r = l + 1; let m = i;
            if (l < h.length && this._c(h[l], h[m]) < 0) m = l;
            if (r < h.length && this._c(h[r], h[m]) < 0) m = r;
            if (m === i) break; const t = h[i]; h[i] = h[m]; h[m] = t; i = m;
          }
        }
        return top;
      }
      dequeue() { return this.pop(); }
    }

    /* ------------------------------------------------------------------ *
     *  Execution                                                          *
     * ------------------------------------------------------------------ */
    const fmtVal = (v) => {
      if (typeof v === 'string') return v;
      try { return JSON.stringify(__S.normalizeOut(v)); } catch (e) { return String(v); }
    };
    function lineFromStack(err, offset) {
      const st = String((err && err.stack) || '');
      const m = st.match(/<anonymous>:(\d+):(\d+)/);
      if (!m) return null;
      const ln = +m[1] - offset;
      return ln > 0 ? ln : null;
    }

    function compile(code, fnName, logs) {
      const inst = instrument(code);
      const fakeConsole = {
        log: (...a) => { if (logs.size < 20000) { const s = a.map(fmtVal).join(' '); logs.size += s.length; logs.out.push(s); } },
      };
      fakeConsole.info = fakeConsole.warn = fakeConsole.error = fakeConsole.debug = fakeConsole.log;
      const body = '"use strict";\n' + inst + '\n;return (typeof ' + fnName + ' === "function") ? ' + fnName + ' : undefined;';
      const factory = new Function('__tk', '__en', '__ex', '__al', '__st', 'ListNode', 'TreeNode', 'PriorityQueue', 'MinPriorityQueue', 'MaxPriorityQueue', 'console', body);
      const MinPQ = class extends PriorityQueue { constructor(f) { super(f ? (a, b) => f(a) - f(b) : undefined); } };
      const MaxPQ = class extends PriorityQueue { constructor(f) { super(f ? (a, b) => f(b) - f(a) : (a, b) => b - a); } };
      const fn = factory(__tk, __en, __ex, __al, __st, __S.ListNode, __S.TreeNode, PriorityQueue, MinPQ, MaxPQ, fakeConsole);
      return fn;
    }

    function runOne(fn, msg, rawArgs, budget) {
      const args = msg.params.map((p, i) => __S.convertIn(p[1], rawArgs[i]));
      reset(budget);
      for (const a of args) __S.walkInputs(a, (o) => inputs.add(o));
      const t0 = performance.now();
      let out, err = null, tle = false;
      ACTIVE = true;
      try { out = fn.apply(null, args); }
      catch (e) {
        if (e === BUDGET_ERR) tle = true;
        else err = e;
      } finally { ACTIVE = false; }
      const ms = performance.now() - t0;
      if (msg.inplace !== undefined && msg.inplace !== null && !err && !tle) out = args[msg.inplace];
      return { out, err, tle, ms, ops: OPS, peak: PEAK, depth: MAXDEPTH };
    }

    function describeError(e) {
      if (e instanceof RangeError && /call stack/i.test(e.message)) return 'RangeError: 遞迴太深（Maximum call stack size exceeded）';
      return (e && e.name ? e.name + ': ' : '') + (e && e.message !== undefined ? e.message : String(e));
    }

    self.onmessage = function (ev) {
      const msg = ev.data;
      const reply = (data) => self.postMessage(Object.assign({ id: msg.id }, data));
      if (msg.type === 'ping') return reply({ ok: true });
      const logs = { out: [], size: 0 };
      let fn;
      try {
        fn = compile(msg.code, msg.fn, logs);
      } catch (e) {
        let line = e && e.loc ? e.loc.line : lineFromStack(e, 3);
        return reply({ compileError: (e instanceof SyntaxError ? 'SyntaxError: ' : '') + String(e.message || e).replace(/\s*\(\d+:\d+\)$/, ''), line });
      }
      if (typeof fn !== 'function') return reply({ compileError: '找不到函式 ' + msg.fn + '()，請確認函式名稱沒有被改掉。' });

      const results = [];
      const tStart = performance.now();
      for (let i = 0; i < msg.cases.length; i++) {
        const c = msg.cases[i];
        const logStart = logs.out.length;
        // re-create the program for every case so module-level caches (memo tables) do not leak between cases
        if (i > 0) { try { fn = compile(msg.code, msg.fn, logs); } catch (e) { /* keep previous instance */ } }
        const r = runOne(fn, msg, c.args, msg.budget);
        const item = { ms: r.ms, ops: r.ops, space: r.peak + r.depth, peak: r.peak, depth: r.depth, n: c.n };
        if (r.tle) item.tle = true;
        else if (r.err) { item.error = describeError(r.err); item.line = lineFromStack(r.err, 3); }
        else { try { item.out = __S.normalizeOut(r.out); } catch (e) { item.error = '無法序列化回傳值：' + e.message; } }
        if (msg.mode === 'test') item.stdout = logs.out.slice(logStart).join('\n');
        results.push(item);
        if (msg.mode === 'analyze' && (r.tle || r.err)) break;
        if (msg.mode === 'analyze' && performance.now() - tStart > (msg.timeLimit || 6000)) break;
        if (msg.mode === 'test' && msg.stopOnError && (r.tle || r.err)) break;
      }
      reply({ results });
    };
  }
  root.__lcJsWorker = __lcJsWorker;
})(typeof window !== 'undefined' ? window : globalThis);
