/* Main-thread side of the code runner: builds tests, talks to sandbox workers, judges results. */
(function (root) {
  const LC = (root.LC = root.LC || {});
  const S = root.__lcShared();
  LC.DS = S;
  // reference solutions run on the main thread and use these globals
  class PriorityQueue {
    constructor(compare) { this._h = []; this._c = compare || ((a, b) => a - b); }
    size() { return this._h.length; }
    isEmpty() { return this._h.length === 0; }
    peek() { return this._h[0]; }
    push(v) {
      const h = this._h; h.push(v); let i = h.length - 1;
      while (i > 0) { const p = (i - 1) >> 1; if (this._c(h[i], h[p]) < 0) { [h[i], h[p]] = [h[p], h[i]]; i = p; } else break; }
      return this;
    }
    pop() {
      const h = this._h; if (!h.length) return undefined;
      const top = h[0]; const last = h.pop();
      if (h.length) {
        h[0] = last; let i = 0;
        for (;;) {
          const l = 2 * i + 1, r = l + 1; let m = i;
          if (l < h.length && this._c(h[l], h[m]) < 0) m = l;
          if (r < h.length && this._c(h[r], h[m]) < 0) m = r;
          if (m === i) break; [h[i], h[m]] = [h[m], h[i]]; i = m;
        }
      }
      return top;
    }
  }
  root.ListNode = S.ListNode;
  root.TreeNode = S.TreeNode;
  root.PriorityQueue = PriorityQueue;

  const DEFAULT_PYODIDE = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
  function pyodideUrl() {
    try {
      const q = new URLSearchParams(location.search).get('pyodide');
      if (q) return q.endsWith('/') ? q : q + '/';
      const ls = localStorage.getItem('lc_pyodide_url');
      if (ls) return ls;
    } catch (e) { /* ignore */ }
    return DEFAULT_PYODIDE;
  }

  const LANGS = {
    javascript: { id: 'javascript', name: 'JavaScript', short: 'JS', icon: '🟨', mode: 'javascript', budgetTest: 3e7, budgetCx: 8e6, cxTime: 7000, wall: 20000 },
    python: { id: 'python', name: 'Python', short: 'PY', icon: '🐍', mode: 'python', budgetTest: 1e7, budgetCx: 1.5e6, cxTime: 12000, wall: 45000 },
  };
  LC.LANGS = LANGS;

  const workers = {};
  let seq = 0;
  const pending = {};

  function workerSource(lang) {
    if (lang === 'javascript') {
      return 'var acorn = (' + root.__acornFactory.toString() + ')();\nvar __S = (' + root.__lcShared.toString() + ')();\n(' + root.__lcJsWorker.toString() + ')();';
    }
    return 'self.__PYODIDE_URL = ' + JSON.stringify(pyodideUrl()) + ';\nself.__PY_HARNESS = ' + JSON.stringify(root.__lcPyHarness) + ';\n(' + root.__lcPyWorker.toString() + ')();';
  }
  function getWorker(lang) {
    if (workers[lang]) return workers[lang];
    const blob = new Blob([workerSource(lang)], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const w = new Worker(url);
    w.onmessage = (ev) => { const p = pending[ev.data.id]; if (p) { delete pending[ev.data.id]; clearTimeout(p.timer); p.resolve(ev.data); } };
    w.onerror = (ev) => {
      for (const id in pending) { if (pending[id].lang === lang) { clearTimeout(pending[id].timer); pending[id].resolve({ fatal: '工作執行緒錯誤：' + (ev.message || '未知錯誤') }); delete pending[id]; } }
    };
    workers[lang] = w;
    return w;
  }
  function killWorker(lang) {
    if (workers[lang]) { workers[lang].terminate(); delete workers[lang]; }
    if (lang === 'python') pyState.ready = false;
  }
  function call(lang, msg, timeoutMs) {
    return new Promise((resolve) => {
      const id = ++seq;
      const w = getWorker(lang);
      const timer = setTimeout(() => {
        delete pending[id];
        killWorker(lang);
        resolve({ timeout: true });
      }, timeoutMs);
      pending[id] = { resolve, timer, lang };
      w.postMessage(Object.assign({ id }, msg));
    });
  }

  const pyState = { ready: false, loading: null };
  function ensureLang(lang, onStatus) {
    if (lang !== 'python') return Promise.resolve(true);
    if (pyState.ready) return Promise.resolve(true);
    if (pyState.loading) return pyState.loading;
    onStatus && onStatus('loading');
    pyState.loading = call('python', { type: 'ping' }, 120000).then((r) => {
      pyState.loading = null;
      if (r && r.ok) { pyState.ready = true; onStatus && onStatus('ready'); return true; }
      onStatus && onStatus('error', (r && r.fatal) || '載入逾時，請檢查網路連線（Python 引擎需要從 CDN 下載）。');
      killWorker('python');
      return false;
    });
    return pyState.loading;
  }

  /* -------------------- expected outputs -------------------- */
  const clone = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
  function runRef(P, args) {
    const conv = P.params.map((p, i) => S.convertIn(p[1], clone(args[i])));
    let out = P.ref.apply(null, conv);
    if (P.inplace !== undefined) out = conv[P.inplace];
    return S.normalizeOut(out);
  }
  function sortKey(v) { return JSON.stringify(v); }
  function canon(v, mode) {
    if (!Array.isArray(v)) return v;
    if (mode === 'unordered') return v.slice().sort((a, b) => (sortKey(a) < sortKey(b) ? -1 : sortKey(a) > sortKey(b) ? 1 : 0));
    if (mode === 'unorderedDeep') return canon(v.map((x) => (Array.isArray(x) ? canon(x, 'unordered') : x)), 'unordered');
    return v;
  }
  function judge(P, out, expected, args) {
    if (P.check) {
      try { return !!P.check(out, clone(args), expected); } catch (e) { return false; }
    }
    if (P.cmp === 'float') return S.deepEqual(out, expected, 1e-5);
    if (P.cmp) return S.deepEqual(canon(out, P.cmp), canon(expected, P.cmp));
    return S.deepEqual(out, expected);
  }

  function buildTests(P, seed) {
    const R = S.makeRng(seed);
    const cases = [];
    (P.examples || []).forEach((e) => cases.push({ args: e.args, kind: 'example' }));
    (P.tests || []).forEach((a) => cases.push({ args: a, kind: 'edge' }));
    if (P.gen) {
      const [lo, hi] = P.rand || [1, 30];
      const count = P.randCount || 10;
      for (let i = 0; i < count; i++) {
        const n = Math.round(lo + (hi - lo) * (i / Math.max(1, count - 1)) * (0.6 + 0.4 * R.next()));
        cases.push({ args: P.gen(R, Math.max(lo, n)), kind: 'random' });
      }
      // Easy problems: big tests only need to stop exponential / runaway code, brute force O(n²) should still pass
      // (the complexity grade tells the player it can be better). Medium / Hard keep their LeetCode-like limits.
      (P.big || []).forEach((n) => cases.push({ args: P.gen(R, P.diff === 'easy' ? Math.min(n, 2000) : n), kind: 'big' }));
    }
    for (const c of cases) c.expected = runRef(P, c.args);
    return cases;
  }

  function signature(P) {
    return { fn: P.fn, params: P.params, inplace: P.inplace };
  }

  /* Run only the examples (the "執行" button). */
  async function runExamples(P, lang, code, onStatus) {
    const ok = await ensureLang(lang, onStatus);
    if (!ok) return { status: 'ENV', message: 'Python 引擎無法載入' };
    const cases = (P.examples || []).map((e) => ({ args: e.args }));
    cases.forEach((c) => (c.expected = runRef(P, c.args)));
    const L = LANGS[lang];
    const res = await call(lang, Object.assign({ type: 'run', mode: 'test', code, cases: cases.map((c) => ({ args: c.args })), budget: L.budgetTest }, signature(P)), L.wall);
    return interpret(P, cases, res);
  }

  function interpret(P, cases, res) {
    if (res.timeout) return { status: 'TLE', message: '執行逾時：可能有無窮迴圈，或演算法太慢。', cases: [] };
    if (res.fatal) return { status: 'RE', message: res.fatal, cases: [] };
    if (res.compileError) return { status: 'CE', message: res.compileError, line: res.line, cases: [] };
    const out = [];
    let status = 'AC', first = null;
    res.results.forEach((r, i) => {
      const c = cases[i];
      const item = { args: c.args, expected: c.expected, kind: c.kind, stdout: r.stdout, ms: r.ms };
      if (r.tle) { item.status = 'TLE'; }
      else if (r.error) { item.status = 'RE'; item.error = r.error; item.line = r.line; }
      else { item.output = r.out; item.status = judge(P, r.out, c.expected, c.args) ? 'AC' : 'WA'; }
      if (item.status !== 'AC' && !first) { first = item; status = item.status; }
      out.push(item);
    });
    if (res.results.length < cases.length && status === 'AC') status = 'RE';
    return { status, cases: out, first, total: cases.length, passed: out.filter((x) => x.status === 'AC').length };
  }

  /* Full submission: all tests, then complexity analysis. */
  async function submit(P, lang, code, onStatus) {
    const ok = await ensureLang(lang, onStatus);
    if (!ok) return { status: 'ENV', message: 'Python 引擎無法載入' };
    const L = LANGS[lang];
    onStatus && onStatus('testing');
    const cases = buildTests(P, (Date.now() & 0x7fffffff) ^ 0x5bd1e995);
    const res = await call(lang, Object.assign({ type: 'run', mode: 'test', stopOnError: true, code, cases: cases.map((c) => ({ args: c.args })), budget: L.budgetTest }, signature(P)), L.wall);
    const verdict = interpret(P, cases, res);
    verdict.total = cases.length;
    if (verdict.status !== 'AC') return verdict;
    onStatus && onStatus('analyzing');
    verdict.analysis = await analyze(P, lang, code);
    return verdict;
  }

  async function analyze(P, lang, code) {
    const L = LANGS[lang];
    const cx = P.cx || {};
    const sizes = cx.sizes || [64, 128, 256, 512, 1024, 2048, 4096];
    const gen = cx.gen || P.gen;
    if (!gen) return null;
    const R = S.makeRng(12345);
    const cases = sizes.map((n) => ({ n, args: gen(R, n, true) }));
    const res = await call(lang, Object.assign({ type: 'run', mode: 'analyze', code, cases, budget: L.budgetCx, timeLimit: L.cxTime }, signature(P)), L.cxTime + 15000);
    if (!res || !res.results) return { error: true };
    const good = res.results.filter((r) => !r.tle && !r.error);
    const censored = res.results.some((r) => r.tle);
    const ptsT = good.map((r) => ({ n: r.n, y: r.ops }));
    const ptsP = good.map((r) => ({ n: r.n, y: r.peak }));
    const ptsD = good.map((r) => ({ n: r.n, y: r.depth }));
    const C = LC.Complexity;
    const isExp = (k) => C.INDEX[k] >= C.INDEX['2^n'];
    const exp = !!cx.exponential && isExp(cx.time || 'n');
    const expS = !!cx.exponential && isExp(cx.space || 'n');
    let t = C.estimate(ptsT, { exponential: exp, censored });
    if (censored && good.length < 3) {
      // the solution blew the budget early: report at least quadratic (or exponential for tiny n)
      t = { key: exp ? (cx.time || '2^n') : (C.INDEX[t.key] < C.INDEX['n^2'] ? 'n^2' : t.key), confidence: 0.3 };
    }
    const sp = C.estimate(ptsP, { flatAbs: 2, exponential: expS });
    const sd = C.estimate(ptsD, { flatAbs: 1, exponential: false, maxClass: 'n' });
    let space = C.INDEX[sp.key] >= C.INDEX[sd.key] ? sp.key : sd.key;
    if (C.INDEX[space] > C.INDEX[t.key]) space = t.key; // space can never exceed time
    return {
      time: t.key, space,
      points: res.results.map((r) => ({ n: r.n, ops: r.ops, peak: r.peak, depth: r.depth, ms: r.ms, tle: !!r.tle })),
      censored, reliable: good.length >= 3,
    };
  }

  LC.Runner = { LANGS, ensureLang, runExamples, submit, analyze, buildTests, runRef, judge, pyState, killWorker, pyodideUrl, call };
})(typeof window !== 'undefined' ? window : globalThis);
