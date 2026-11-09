/* The play screen: lesson + problem + editor + battle + judging + results. Shared by story & challenge. */
(function (root) {
  const LC = (root.LC = root.LC || {});
  const UI = LC.UI;
  const esc = (s) => LC.util.esc(s);
  const G = () => LC.Game.S;

  /* ---------------- starter code ---------------- */
  const JS_T = { int: 'number', float: 'number', bool: 'boolean', string: 'string', 'int[]': 'number[]', 'int[][]': 'number[][]', 'string[]': 'string[]', 'string[][]': 'string[][]', 'char[][]': 'character[][]', ListNode: 'ListNode', TreeNode: 'TreeNode', 'ListNode[]': 'ListNode[]', void: 'void' };
  const PY_T = { int: 'int', float: 'float', bool: 'bool', string: 'str', 'int[]': 'List[int]', 'int[][]': 'List[List[int]]', 'string[]': 'List[str]', 'string[][]': 'List[List[str]]', 'char[][]': 'List[List[str]]', ListNode: 'Optional[ListNode]', TreeNode: 'Optional[TreeNode]', 'ListNode[]': 'List[Optional[ListNode]]', void: 'None' };
  function usesType(P, t) { return P.params.some((p) => p[1].startsWith(t)) || (P.ret || '').startsWith(t); }
  function starter(P, lang) {
    const names = P.params.map((p) => p[0]);
    if (lang === 'python') {
      let head = '';
      if (usesType(P, 'ListNode')) head += '# 鏈結串列節點（已預先定義，可直接使用）：\n# class ListNode:\n#     def __init__(self, val=0, next=None):\n#         self.val = val\n#         self.next = next\n\n';
      if (usesType(P, 'TreeNode')) head += '# 二元樹節點（已預先定義，可直接使用）：\n# class TreeNode:\n#     def __init__(self, val=0, left=None, right=None):\n#         self.val = val\n#         self.left = left\n#         self.right = right\n\n';
      const sig = P.params.map((p) => p[0] + ': ' + PY_T[p[1]]).join(', ');
      const body = P.ret === 'void' ? `    # 請「原地」修改 ${names[P.inplace || 0]}，不需要回傳\n    pass` : '    # 在這裡寫下你的程式碼\n    pass';
      return head + `def ${P.fn}(${sig}) -> ${PY_T[P.ret] || 'None'}:\n${body}\n`;
    }
    let head = '';
    if (usesType(P, 'ListNode')) head += '/**\n * 鏈結串列節點（已預先定義，可直接使用）：\n * class ListNode {\n *   constructor(val = 0, next = null) { this.val = val; this.next = next; }\n * }\n */\n';
    if (usesType(P, 'TreeNode')) head += '/**\n * 二元樹節點（已預先定義，可直接使用）：\n * class TreeNode {\n *   constructor(val = 0, left = null, right = null) { this.val = val; this.left = left; this.right = right; }\n * }\n */\n';
    const doc = '/**\n' + P.params.map((p) => ` * @param {${JS_T[p[1]]}} ${p[0]}\n`).join('') + ` * @return {${JS_T[P.ret] || 'void'}}${P.ret === 'void' ? ` 請「原地」修改 ${names[P.inplace || 0]}，不需要回傳` : ''}\n */\n`;
    return head + doc + `function ${P.fn}(${names.join(', ')}) {\n  // 在這裡寫下你的程式碼\n  \n}\n`;
  }
  UI.starter = starter;

  /* ---------------- rendering helpers ---------------- */
  const short = (v, n, raw) => { const s = raw ? String(v) : LC.util.fmtVal(v); return s.length > (n || 400) ? s.slice(0, n || 400) + ` …（共 ${s.length} 字元）` : s; };
  function renderLesson(level, lang) {
    return level.lesson.map((b) => {
      if (b.t === 'p') return `<p>${b.html}</p>`;
      if (b.t === 'h') return `<h3>${b.html}</h3>`;
      if (b.t === 'tip') return `<div class="tipbox">💡 ${b.html}</div>`;
      if (b.t === 'cx') return `<div class="cxbox">⏱️ ${b.html}</div>`;
      if (b.t === 'code') return `<pre class="code lang-${lang}"><code>${esc(lang === 'python' ? b.py : b.js)}</code></pre>`;
      return '';
    }).join('');
  }
  function renderProblem(P, lang) {
    return `<div class="prob">
      <div class="prob-meta">${UI.diffBadge(P.diff)} ${(P.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join('')} ${P.lc ? `<span class="tag lc">LeetCode #${P.lc}</span>` : ''}</div>
      <div class="prob-desc">${P.desc}</div>
      ${(P.examples || []).map((e, i) => {
        let out; try { out = LC.Runner.runRef(P, e.args); } catch (er) { out = '?'; }
        return `<div class="example"><b>範例 ${i + 1}</b><pre><span class="k">輸入：</span>${esc(LC.util.fmtArgs(P, e.args))}\n<span class="k">輸出：</span>${esc(LC.util.fmtVal(out))}${e.note ? `\n<span class="k">說明：</span>${esc(e.note)}` : ''}</pre></div>`;
      }).join('')}
      <p class="muted small">函式名稱：<code>${P.fn}</code>・語言：${LC.LANGS[lang].icon} ${LC.LANGS[lang].name}</p>
    </div>`;
  }

  function cxLabel(P, key) { return LC.Complexity.label(key, P.cx && P.cx.labels); }

  function chartSvg(points) {
    const pts = (points || []).filter((p) => !p.tle);
    if (pts.length < 2) return '';
    const W = 320, H = 120, pad = 30;
    const maxY = Math.max(...pts.map((p) => p.ops)) || 1;
    const x = (i) => pad + (i * (W - pad - 22)) / (pts.length - 1);
    const y = (v) => H - 18 - (v / maxY) * (H - 30);
    const line = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p.ops).toFixed(1)}`).join(' ');
    const fmt = (v) => (v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? (v / 1e3).toFixed(1) + 'k' : String(v));
    return `<svg class="cx-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="運算次數隨輸入規模成長的圖表">
      <line x1="${pad}" y1="${H - 18}" x2="${W - 4}" y2="${H - 18}" class="axis"/><line x1="${pad}" y1="8" x2="${pad}" y2="${H - 18}" class="axis"/>
      <path d="${line}" class="ln"/>
      ${pts.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.ops)}" r="3.5" class="dot"><title>n = ${p.n}：${p.ops.toLocaleString()} 次運算</title></circle><text x="${x(i)}" y="${H - 5}" class="tx" text-anchor="middle">${fmt(p.n)}</text>`).join('')}
      <text x="4" y="14" class="tx">${fmt(maxY)}</text><text x="${W - 4}" y="${H - 22}" class="tx" text-anchor="end">n →</text>
    </svg>`;
  }

  /* ---------------- the screen ---------------- */
  UI.screens.play = {
    st: null,
    render(view, parts) {
      const mode = parts[0];
      const [rawId, query] = (parts[1] || '').split('?');
      const params = new URLSearchParams(query || '');
      const S = G();
      const lang = S.lang;
      let level = null, P;
      if (mode === 'story') {
        level = LC.Story.byId[rawId];
        if (!level) return UI.go('#/story');
        if (!UI.isUnlocked(lang, level)) { UI.toast('這一關還沒解鎖喔！', 'bad'); return UI.go('#/story'); }
        P = LC.Problems[level.problem];
      } else {
        P = LC.Problems[rawId];
        if (!P) return UI.go('#/challenge');
      }
      const daily = params.get('daily') === '1';
      const key = (mode === 'story' ? 'story:' + level.id : 'ch:' + P.id) + ':' + lang;
      const st = (this.st = { mode, level, P, lang, key, daily, start: Date.now(), fails: 0, hints: 0, busy: false, solved: false, cm: null, timer: null, hp: 1 });
      const ch = level ? LC.Story.chapters[level.ch - 1] : null;

      view.innerHTML = `
        <div class="play ${mode}">
          <div class="play-head">
            <a class="btn ghost sm" href="${mode === 'story' ? '#/story' : '#/challenge'}">← 返回</a>
            <div class="ph-title">
              <small>${level ? `${esc(ch.name)}・第 ${level.id} 關・${esc(level.concept)}` : daily ? '📅 每日挑戰' : '⚔️ 挑戰模式'}</small>
              <h1>${P.lc ? `<span class="lcnum">#${P.lc}</span> ` : ''}${esc(P.title)} ${UI.diffBadge(P.diff)}</h1>
            </div>
            <div class="ph-right"><span class="timer" id="timer" title="答題時間">⏱ 00:00</span><span class="lang-tag">${LC.LANGS[lang].icon} ${LC.LANGS[lang].name}</span></div>
          </div>
          <div class="play-body">
            <div class="pane left">
              ${level ? `<div class="battle bg-${ch.bg}" style="--accent:${ch.color}">
                <div class="b-hero" id="b-hero">${LC.Avatar.render(S.equip, S.look)}</div>
                <div class="b-vs">VS</div>
                <div class="b-mon" id="b-mon">
                  <div class="hp"><span>${level.boss ? '👑 ' + esc(ch.boss) : '守衛'}</span><div class="hpbar"><i id="hpbar" style="width:100%"></i></div></div>
                  ${LC.Monsters.render(ch.monster, { boss: !!level.boss })}
                </div>
                <div class="b-say">${esc(level.story)}</div>
              </div>` : ''}
              <div class="tabs" role="tablist">
                ${level ? '<button class="tab on" data-tab="lesson">📖 課程</button>' : ''}
                <button class="tab ${level ? '' : 'on'}" data-tab="problem">📝 題目</button>
                <button class="tab" data-tab="hints">💡 提示</button>
                <button class="tab" data-tab="result" id="tab-result">📊 結果</button>
              </div>
              <div class="tab-body" id="tab-body"></div>
            </div>
            <div class="pane right">
              <div class="editor-bar">
                <span class="file">${lang === 'python' ? 'solution.py' : 'solution.js'}</span>
                <span class="grow"></span>
                <button class="btn ghost sm" id="btn-reset" title="恢復成初始程式碼">↺ 重設</button>
              </div>
              <div class="editor" id="editor"></div>
              <div class="actions">
                <span class="kbd-hint">Ctrl + Enter 執行</span>
                <button class="btn" id="btn-run">▶ 執行範例</button>
                <button class="btn primary" id="btn-submit">⚔️ 提交</button>
              </div>
              <div class="console" id="console"><div class="muted">按「▶ 執行範例」測試你的程式，或按「⚔️ 提交」挑戰所有測資（包含隱藏的邊界與大型測資）。</div></div>
            </div>
          </div>
        </div>`;

      const tabBody = view.querySelector('#tab-body');
      const tabs = {
        lesson: () => `<div class="lesson">${renderLesson(level, lang)}<button class="btn primary" data-goto="problem">開始挑戰 →</button></div>`,
        problem: () => renderProblem(P, lang),
        hints: () => this.hintsHtml(),
        result: () => st.resultHtml || '<p class="muted">提交後會在這裡顯示結果與複雜度分析。</p>',
      };
      st.showTab = (t) => {
        view.querySelectorAll('.tab').forEach((b) => b.classList.toggle('on', b.dataset.tab === t));
        tabBody.innerHTML = tabs[t]();
        tabBody.scrollTop = 0;
        tabBody.querySelectorAll('[data-goto]').forEach((b) => (b.onclick = () => st.showTab(b.dataset.goto)));
        tabBody.querySelectorAll('[data-hint]').forEach((b) => (b.onclick = () => this.revealHint(+b.dataset.hint)));
        tabBody.querySelectorAll('[data-solution]').forEach((b) => (b.onclick = () => this.showSolution()));
      };
      view.querySelectorAll('.tab').forEach((b) => (b.onclick = () => st.showTab(b.dataset.tab)));
      st.showTab(level ? 'lesson' : 'problem');

      // editor
      const saved = S.code[key];
      this.mountEditor(view.querySelector('#editor'), saved != null ? saved : starter(P, lang), lang);
      view.querySelector('#btn-reset').onclick = async () => {
        if (await UI.confirm('<h3>重設程式碼？</h3><p>目前的程式碼會被初始範本取代。</p>', '重設')) { this.setCode(starter(P, lang)); }
      };
      view.querySelector('#btn-run').onclick = () => this.run();
      view.querySelector('#btn-submit').onclick = () => this.submit();
      st.timer = setInterval(() => {
        const el = document.getElementById('timer');
        if (!el) return;
        const s = Math.floor((Date.now() - st.start) / 1000);
        el.textContent = '⏱ ' + String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
      }, 1000);
      if (lang === 'python') LC.Runner.ensureLang('python', UI.pyStatus);
    },
    leave() {
      const st = this.st;
      if (!st) return;
      clearInterval(st.timer);
      this.saveCode();
      this.st = null;
    },

    /* ---------- editor ---------- */
    mountEditor(el, value, lang) {
      const st = this.st;
      const runKey = () => this.run();
      if (window.CodeMirror) {
        const unit = lang === 'python' ? 4 : 2;
        const cm = window.CodeMirror(el, {
          value, mode: lang === 'python' ? 'python' : 'javascript', theme: 'dracula', lineNumbers: true,
          indentUnit: unit, tabSize: unit, indentWithTabs: false, matchBrackets: true, autoCloseBrackets: true, lineWrapping: false,
          extraKeys: {
            Tab: (c) => (c.somethingSelected() ? c.indentSelection('add') : c.replaceSelection(' '.repeat(unit), 'end')),
            'Shift-Tab': (c) => c.indentSelection('subtract'),
            'Ctrl-Enter': runKey, 'Cmd-Enter': runKey,
            'Ctrl-/': 'toggleComment', 'Cmd-/': 'toggleComment',
          },
        });
        cm.on('change', () => { this.clearErrLine(); this.saveCodeSoon(); });
        st.cm = cm;
        setTimeout(() => cm.refresh(), 30);
      } else {
        const ta = document.createElement('textarea');
        ta.className = 'fallback-editor'; ta.value = value; ta.spellcheck = false;
        ta.addEventListener('keydown', (e) => {
          if (e.key === 'Tab') { e.preventDefault(); const s = ta.selectionStart; ta.setRangeText(' '.repeat(lang === 'python' ? 4 : 2), s, ta.selectionEnd, 'end'); }
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); runKey(); }
        });
        ta.addEventListener('input', () => this.saveCodeSoon());
        el.appendChild(ta);
        st.ta = ta;
      }
    },
    getCode() { const st = this.st; return st.cm ? st.cm.getValue() : st.ta.value; },
    setCode(v) { const st = this.st; if (st.cm) st.cm.setValue(v); else st.ta.value = v; this.saveCode(); },
    saveCode() { const st = this.st; if (!st) return; G().code[st.key] = this.getCode(); LC.Game.save(); },
    saveCodeSoon() { clearTimeout(this._sv); this._sv = setTimeout(() => this.saveCode(), 600); },
    markErrLine(line) {
      const st = this.st;
      if (!st.cm || !line) return;
      this.clearErrLine();
      const ln = Math.min(line - 1, st.cm.lineCount() - 1);
      st.cm.addLineClass(ln, 'background', 'err-line');
      st.errLine = ln;
      st.cm.scrollIntoView({ line: ln, ch: 0 }, 80);
    },
    clearErrLine() { const st = this.st; if (st && st.cm && st.errLine != null) { st.cm.removeLineClass(st.errLine, 'background', 'err-line'); st.errLine = null; } },

    /* ---------- hints & solution ---------- */
    hintsHtml() {
      const st = this.st, P = st.P;
      const shown = st.hintShown || 0;
      const hs = P.hints || [];
      const isChal = st.mode !== 'story';
      return `<div class="hints">
        ${isChal ? '<p class="muted small">挑戰模式中，每看一個提示評分會 −4 分。</p>' : '<p class="muted small">故事模式的提示是免費的，卡關時盡量看！</p>'}
        ${hs.map((h, i) => (i < shown ? `<div class="hint shown"><b>提示 ${i + 1}</b><p>${h}</p></div>` : i === shown ? `<button class="btn" data-hint="${i}">💡 顯示提示 ${i + 1}</button>` : '')).join('')}
        ${shown >= hs.length && P.cx ? `<div class="hint shown"><b>🎯 目標複雜度</b><p>時間 ${cxLabel(P, (st.level && st.level.cxTime) || P.cx.time)}・空間 ${cxLabel(P, P.cx.space)}${P.cx.note ? `<br><small class="muted">${esc(P.cx.note)}</small>` : ''}</p></div>` : ''}
        ${st.solved || shown >= hs.length ? `<button class="btn ghost" data-solution>📘 查看參考解答${st.solved ? '' : '（會放棄這次的評分）'}</button>` : ''}
      </div>`;
    },
    async revealHint(i) {
      const st = this.st;
      if (st.mode !== 'story' && !st.solved && !st.hintWarned) {
        if (!(await UI.confirm('<h3>要看提示嗎？</h3><p>挑戰模式中每個提示會讓評分 −4 分。</p>', '看提示'))) return;
        st.hintWarned = true;
      }
      st.hintShown = Math.max(st.hintShown || 0, i + 1);
      if (!st.solved) st.hints = st.hintShown;
      st.showTab('hints');
    },
    showSolution() {
      const st = this.st, P = st.P;
      if (!st.solved) { st.gaveUp = true; }
      UI.modal(`<h2>📘 參考解答：${esc(P.title)}</h2>
        <div class="explain">${P.explain || ''}</div>
        ${P.cx ? `<p><b>複雜度：</b>時間 ${cxLabel(P, P.cx.time)}・空間 ${cxLabel(P, P.cx.space)}</p>` : ''}
        <pre class="code"><code>${esc(LC.util.solutionCode(P, st.lang))}</code></pre>
        <p class="muted small">先自己想過再看解答，學得最快！看完後試著不看答案自己寫一次。</p>`, { wide: true });
    },

    /* ---------- run / submit ---------- */
    consoleEl() { return document.getElementById('console'); },
    setBusy(b, label) {
      const st = this.st;
      st.busy = b;
      const run = document.getElementById('btn-run'), sub = document.getElementById('btn-submit');
      if (run) run.disabled = b;
      if (sub) sub.disabled = b;
      if (b && label) this.consoleEl().innerHTML = `<div class="running"><span class="spin"></span> ${label}</div>`;
    },
    statusLabel(s) {
      return { loading: '正在載入 Python 引擎（首次約 5～20 秒）…', testing: '正在執行所有測資…', analyzing: '全部通過！正在用不同大小的輸入量測時間與空間複雜度…' }[s] || '執行中…';
    },
    async run() {
      const st = this.st;
      if (!st || st.busy) return;
      this.saveCode();
      this.setBusy(true, '執行範例中…');
      const hero = document.getElementById('b-hero');
      if (hero) { hero.classList.remove('hop'); void hero.offsetWidth; hero.classList.add('hop'); }
      const res = await LC.Runner.runExamples(st.P, st.lang, this.getCode(), (s, m) => { UI.pyStatus(s, m); if (s === 'loading') this.setBusy(true, this.statusLabel(s)); });
      if (!this.st || this.st !== st) return;
      this.setBusy(false);
      this.renderRun(res);
    },
    renderRun(res) {
      const st = this.st;
      const el = this.consoleEl();
      if (res.status === 'CE' || res.status === 'ENV' || (res.status !== 'AC' && !res.cases.length)) {
        el.innerHTML = this.errorBox(res);
        if (res.line) this.markErrLine(res.line);
        return;
      }
      el.innerHTML = `<div class="run-head ${res.status === 'AC' ? 'good' : 'bad'}">${res.status === 'AC' ? '✅ 範例全部通過！試試「⚔️ 提交」挑戰隱藏測資。' : `❌ 範例通過 ${res.passed}/${res.total}`}</div>` +
        res.cases.map((c, i) => this.caseBox(c, i, '範例 ' + (i + 1))).join('');
      const bad = res.cases.find((c) => c.line);
      if (bad) this.markErrLine(bad.line);
    },
    caseBox(c, i, label) {
      const P = this.st.P;
      const ok = c.status === 'AC';
      const kind = { example: '範例', edge: '邊界測資', random: '隨機測資', big: '大型測資' }[c.kind] || '';
      return `<div class="case ${ok ? 'ok' : 'bad'}">
        <div class="case-head">${ok ? '✅' : '❌'} <b>${label}</b> ${kind && label.indexOf(kind) < 0 ? `<small>${kind}</small>` : ''} <span class="grow"></span>${c.status !== 'AC' ? `<span class="verdict v-${c.status}">${{ WA: '答案錯誤', RE: '執行錯誤', TLE: '超時' }[c.status] || c.status}</span>` : ''}</div>
        <div class="kv"><span>輸入</span><code>${esc(short(LC.util.fmtArgs(P, c.args), c.kind === 'big' ? 300 : 2000, true))}</code></div>
        <div class="kv"><span>預期</span><code>${esc(short(c.expected))}</code></div>
        ${c.status === 'RE' ? `<div class="kv err"><span>錯誤</span><code>${esc(c.error)}${c.line ? `（第 ${c.line} 行）` : ''}</code></div>` : c.status === 'TLE' ? `<div class="kv err"><span>超時</span><code>超過運算上限：可能有無窮迴圈，或演算法對大型輸入太慢。</code></div>` : `<div class="kv"><span>輸出</span><code>${esc(short(c.output))}</code></div>`}
        ${c.stdout ? `<div class="kv out"><span>主控台</span><pre>${esc(c.stdout.slice(0, 3000))}</pre></div>` : ''}
      </div>`;
    },
    errorBox(res) {
      const title = { CE: '編譯／語法錯誤', ENV: '環境錯誤', TLE: '超時', RE: '執行錯誤' }[res.status] || '錯誤';
      return `<div class="case bad"><div class="case-head">❌ <b>${title}</b></div><pre class="errmsg">${esc(res.message || '')}${res.line ? `\n（第 ${res.line} 行）` : ''}</pre>
        ${res.status === 'CE' ? '<p class="muted small">檢查括號、冒號、縮排與拼字。錯誤的那一行已經在編輯器中標記出來。</p>' : ''}</div>`;
    },
    async submit() {
      const st = this.st;
      if (!st || st.busy) return;
      this.saveCode();
      const code = this.getCode();
      this.setBusy(true, this.statusLabel('testing'));
      const res = await LC.Runner.submit(st.P, st.lang, code, (s, m) => { UI.pyStatus(s, m); if (['loading', 'testing', 'analyzing'].includes(s)) this.setBusy(true, this.statusLabel(s)); });
      if (!this.st || this.st !== st) return;
      this.setBusy(false);
      if (res.status === 'ENV') { this.consoleEl().innerHTML = this.errorBox(res); return; }
      const ms = Date.now() - st.start;
      if (res.status !== 'AC') {
        st.fails++;
        UI.sfx.fail();
        this.battle(res.passed || 0, res.total || 1, false);
        const el = this.consoleEl();
        if (!res.cases || !res.cases.length) { el.innerHTML = this.errorBox(res); if (res.line) this.markErrLine(res.line); }
        else {
          const idx = res.cases.findIndex((c) => c.status !== 'AC');
          el.innerHTML = `<div class="run-head bad">❌ 第 ${idx + 1}/${res.total} 筆測資沒有通過（已通過 ${res.passed} 筆）</div>` + this.caseBox(res.first, idx, '測資 ' + (idx + 1));
          if (res.first.line) this.markErrLine(res.first.line);
        }
        st.resultHtml = el.innerHTML;
        return;
      }
      // ---- accepted ----
      this.battle(res.total, res.total, true);
      UI.sfx.win();
      const firstSolve = !st.solved;
      st.solved = true;
      let reward;
      if (st.gaveUp && st.mode !== 'story') {
        reward = { grade: LC.Game.grade(st.P, res.analysis, ms, st.fails, st.hints), coins: 0, xp: 0, chest: null, gaveUp: true };
      } else if (st.mode === 'story') {
        reward = LC.Game.completeStory(st.level, st.lang, st.P, res, ms, st.fails, st.hints);
      } else {
        reward = LC.Game.completeChallenge(st.P, st.lang, res, ms, st.fails, st.hints, st.daily);
      }
      this.consoleEl().innerHTML = `<div class="run-head good">🎉 全部 ${res.total} 筆測資通過！</div>`;
      st.resultHtml = this.resultPanel(res, reward, ms);
      UI.renderTopbar();
      setTimeout(() => {
        if (this.st !== st) return;
        this.resultModal(res, reward, ms, firstSolve);
        UI.checkAch();
      }, st.mode === 'story' ? 900 : 300);
    },
    battle(passed, total, win) {
      const hp = document.getElementById('hpbar');
      if (!hp) return;
      const mon = document.getElementById('b-mon'), hero = document.getElementById('b-hero');
      hero.classList.remove('attack', 'hurt'); void hero.offsetWidth;
      hero.classList.add('attack');
      const left = Math.max(0, 1 - passed / total);
      setTimeout(() => {
        hp.style.width = left * 100 + '%';
        if (passed > 0) {
          UI.sfx.hit();
          mon.classList.remove('hit'); void mon.offsetWidth; mon.classList.add('hit');
          const dmg = document.createElement('div');
          dmg.className = 'dmg'; dmg.textContent = '-' + passed * 10;
          mon.appendChild(dmg); setTimeout(() => dmg.remove(), 1200);
        }
        if (win) { mon.classList.add('defeated'); hero.innerHTML = LC.Avatar.render(G().equip, G().look, { mood: 'win' }); UI.confetti(60); }
        else setTimeout(() => { hero.classList.remove('attack'); hero.classList.add('hurt'); hero.innerHTML = LC.Avatar.render(G().equip, G().look, { mood: 'hurt' }); setTimeout(() => { if (document.getElementById('b-hero') === hero) { hero.innerHTML = LC.Avatar.render(G().equip, G().look); hero.classList.remove('hurt'); } }, 1400); }, 350);
      }, 300);
    },
    cxRows(res) {
      const P = this.st.P, a = res.analysis;
      if (!P.cx) return `<div class="cx-row"><span>複雜度</span><b>此題輸入規模固定，不評估</b></div>`;
      if (!a || a.error) return `<div class="cx-row"><span>複雜度</span><b>分析失敗（不影響評分）</b></div>`;
      const opT = (this.st.level && this.st.level.cxTime) || P.cx.time;
      const C = LC.Complexity;
      const row = (name, mine, opt) => {
        const d = C.compare(mine, opt);
        return `<div class="cx-row ${d <= 0 ? 'good' : 'bad'}"><span>${name}</span><b>${cxLabel(P, mine)}</b><small>最佳 ${cxLabel(P, opt)}</small><i>${d <= 0 ? '✔ 最佳' : d === 1 ? '△ 差一級' : '✘ 可再優化'}</i></div>`;
      };
      return row('⏱️ 時間複雜度', a.time, opT) + row('📦 空間複雜度', a.space, P.cx.space) +
        `<details class="cx-detail"><summary>量測細節</summary>${chartSvg(a.points)}<p class="muted small">以 ${a.points.length} 種不同大小的輸入實際執行並計算運算次數（迴圈、函式呼叫、內建函式成本）與記憶體使用來估算。${P.cx.note ? esc(P.cx.note) + '。' : ''}${a.reliable ? '' : '（資料點較少，估算可能不精確）'}</p></details>`;
    },
    resultPanel(res, reward, ms) {
      return `<div class="result-panel"><h3>🎉 通過！</h3>${this.cxRows(res)}<div class="cx-row"><span>⌛ 答題時間</span><b>${LC.util.fmtTime(ms)}</b></div>
        <button class="btn ghost" data-solution>📘 參考解答與解說</button></div>`;
    },
    resultModal(res, reward, ms, firstSolve) {
      const st = this.st, P = st.P;
      const g = reward.grade;
      const isStory = st.mode === 'story';
      let head;
      if (isStory) {
        const labels = ['通過關卡', '最佳時間複雜度', '失敗提交 ≤ 1 次'];
        const got = [true, reward.starOpt, reward.starClean];
        head = `<div class="res-stars">${[0, 1, 2].map((i) => `<div class="rs ${i < reward.stars ? 'on' : ''}" style="animation-delay:${0.25 + i * 0.3}s"><span>★</span><small>${labels[i]}${got[i] ? '' : '（本次未達成）'}</small></div>`).join('')}</div>`;
      } else {
        head = `<div class="res-grade"><div class="grade-big g-${g.letter}">${g.letter}</div><div class="score">${g.score}<small>/100</small></div>
          <div class="breakdown">${[['時間複雜度', g.breakdown.time, 40], ['空間複雜度', g.breakdown.space, 20], ['答題速度', g.breakdown.speed, 25], ['嘗試次數', g.breakdown.tries, 15]].map(([n, v, m]) => `<div><span>${n}</span><div class="bar"><i style="width:${(v / m) * 100}%"></i></div><b>${v}/${m}</b></div>`).join('')}${g.breakdown.hints ? `<div><span>提示</span><div></div><b>${g.breakdown.hints}</b></div>` : ''}</div></div>`;
      }
      const rewards = reward.gaveUp ? '<p class="muted">因為先看了參考解答，這次不計獎勵。</p>' :
        `<div class="rewards">
          <span class="rw">🪙 +${reward.coins}</span><span class="rw">✨ XP +${reward.xp}</span>
          ${reward.chest ? `<span class="rw chest">${UI.chestEmoji(reward.chest)} ${LC.Items.CHESTS[reward.chest].name}${isStory && reward.first ? '（首次通關）' : ''}</span>` : ''}
          ${reward.dailyChest ? `<span class="rw chest">📅 每日挑戰：${LC.Items.CHESTS[reward.dailyChest].name} + 150 金幣</span>` : ''}
          ${reward.repeat ? '<span class="rw muted">（重複解題獎勵減少）</span>' : ''}
        </div>`;
      let next = '';
      if (isStory) {
        const idx = LC.Story.levels.indexOf(st.level);
        const nl = LC.Story.levels[idx + 1];
        const chapterEnd = !nl || nl.ch !== st.level.ch;
        next = nl ? `<a class="btn primary" href="#/play/story/${nl.id}" data-close>${chapterEnd ? '🏰 前往下一層' : '下一關 →'}</a>` : '<a class="btn primary" href="#/story" data-close>🏆 回到地圖</a>';
      } else {
        next = `<button class="btn primary" data-another>🎲 再來一題 ${UI.DIFF[P.diff][0]}</button>`;
      }
      const chapterClear = isStory && st.level.boss && reward.first;
      const m = UI.modal(`<div class="result">
          <h2>${isStory ? (chapterClear ? `🏰 ${esc(LC.Story.chapters[st.level.ch - 1].name)} 淨化完成！` : '🎉 守衛被淨化了！') : '🎉 挑戰成功！'}</h2>
          ${head}
          <div class="cx-box">${this.cxRows(res)}<div class="cx-row"><span>⌛ 答題時間</span><b>${LC.util.fmtTime(ms)}</b>${!isStory ? `<small>目標 ${LC.Game.TARGET_MIN[P.diff]} 分鐘內</small>` : ''}</div></div>
          ${rewards}
          <div class="row gap center wrap">
            <button class="btn ghost" data-sol>📘 解答與解說</button>
            ${reward.chest || reward.dailyChest ? '<button class="btn" data-openchest>🎁 立即開寶箱</button>' : ''}
            ${next}
          </div>
        </div>`, { wide: true });
      m.querySelector('[data-sol]').onclick = () => this.showSolution();
      const oc = m.querySelector('[data-openchest]');
      if (oc) oc.onclick = () => { const t = reward.dailyChest || reward.chest; UI.closeModal(true); UI.openChestFlow(t, () => UI.renderTopbar()); };
      const an = m.querySelector('[data-another]');
      if (an) an.onclick = () => {
        const S = G();
        const list = Object.values(LC.Problems).filter((p) => p.diff === P.diff && p.id !== P.id);
        const fresh = list.filter((p) => !S.solved[st.lang][p.id]);
        const pool = fresh.length ? fresh : list;
        UI.closeModal(true);
        UI.go('#/play/ch/' + pool[Math.floor(Math.random() * pool.length)].id);
      };
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
