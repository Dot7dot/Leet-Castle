/* UI core: router, top bar, modal, toasts, sound effects, confetti. */
(function (root) {
  const LC = (root.LC = root.LC || {});
  const UI = (LC.UI = LC.UI || {});
  const esc = (s) => LC.util.esc(s);
  UI.screens = {};

  UI.$ = (sel, el) => (el || document).querySelector(sel);
  UI.$$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));

  /* ---------------- sound (WebAudio blips, no assets) ---------------- */
  let actx = null;
  function tone(freq, dur, type, vol, delay) {
    try {
      if (!LC.Game.S.settings.sound) return;
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const t = actx.currentTime + (delay || 0);
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(vol || 0.08, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + dur + 0.02);
    } catch (e) { /* audio unavailable */ }
  }
  UI.sfx = {
    click: () => tone(660, 0.06, 'triangle', 0.05),
    hit: () => { tone(220, 0.08, 'square', 0.05); tone(160, 0.12, 'square', 0.04, 0.05); },
    fail: () => { tone(300, 0.15, 'sawtooth', 0.05); tone(200, 0.25, 'sawtooth', 0.05, 0.12); },
    win: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.18, 'triangle', 0.07, i * 0.09)),
    coin: () => { tone(988, 0.06, 'square', 0.04); tone(1318, 0.12, 'square', 0.04, 0.06); },
    open: () => [392, 523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.14, 'triangle', 0.06, i * 0.06)),
    legendary: () => [523, 659, 784, 1046, 784, 1046, 1318, 1568].forEach((f, i) => tone(f, 0.2, 'sine', 0.07, i * 0.08)),
    shake: () => tone(140, 0.05, 'square', 0.03),
  };

  /* ---------------- toasts ---------------- */
  UI.toast = function (html, kind, ms) {
    let box = UI.$('#toasts');
    const t = document.createElement('div');
    t.className = 'toast ' + (kind || '');
    t.innerHTML = html;
    box.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, ms || 3600);
  };
  UI.achToast = function (a) {
    const r = a.reward.chest ? LC.Items.CHESTS[a.reward.chest].name : a.reward.coins + ' 金幣';
    UI.toast(`<div class="t-ach"><div class="t-ach-icon">${a.icon}</div><div><div class="t-ach-label">成就解鎖${a.lang ? '・' + LC.LANGS[a.lang].name : ''}</div><b>${esc(a.name)}</b><div class="t-ach-reward">獎勵：${esc(r)}</div></div></div>`, 'ach', 5000);
    UI.sfx.win();
  };
  UI.checkAch = function () {
    const list = LC.Game.checkAchievements();
    list.forEach((a, i) => setTimeout(() => UI.achToast(a), 600 + i * 900));
    if (list.length) UI.renderTopbar();
    return list;
  };

  /* ---------------- modal ---------------- */
  UI.modal = function (html, opts) {
    opts = opts || {};
    UI.closeModal(true);
    const m = document.createElement('div');
    m.className = 'modal-back' + (opts.cls ? ' ' + opts.cls : '');
    m.innerHTML = `<div class="modal ${opts.wide ? 'wide' : ''}" role="dialog" aria-modal="true">${opts.noClose ? '' : '<button class="modal-x" data-close aria-label="關閉">✕</button>'}${html}</div>`;
    document.body.appendChild(m);
    requestAnimationFrame(() => m.classList.add('show'));
    m.addEventListener('click', (e) => {
      if (e.target.closest('[data-close]') || (e.target === m && !opts.noClose)) { UI.closeModal(); opts.onClose && opts.onClose(); }
    });
    return m.querySelector('.modal');
  };
  UI.closeModal = function (instant) {
    UI.$$('.modal-back').forEach((m) => { if (instant) m.remove(); else { m.classList.remove('show'); setTimeout(() => m.remove(), 250); } });
  };
  UI.confirm = function (html, okText) {
    return new Promise((resolve) => {
      const m = UI.modal(`<div class="confirm">${html}<div class="row end gap"><button class="btn ghost" data-no>取消</button><button class="btn primary" data-yes>${okText || '確定'}</button></div></div>`, { onClose: () => resolve(false) });
      m.querySelector('[data-no]').onclick = () => { UI.closeModal(); resolve(false); };
      m.querySelector('[data-yes]').onclick = () => { UI.closeModal(); resolve(true); };
    });
  };

  /* ---------------- confetti ---------------- */
  UI.confetti = function (n) {
    const colors = ['#f59e0b', '#ef4444', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#fde047'];
    const box = document.createElement('div');
    box.className = 'confetti';
    for (let i = 0; i < (n || 80); i++) {
      const p = document.createElement('i');
      p.style.left = Math.random() * 100 + 'vw';
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = Math.random() * 0.6 + 's';
      p.style.animationDuration = 1.8 + Math.random() * 1.6 + 's';
      p.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
      box.appendChild(p);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 4200);
  };

  /* ---------------- top bar ---------------- */
  const NAV = [
    ['home', '🏰', '大廳'], ['story', '📖', '故事'], ['challenge', '⚔️', '挑戰'],
    ['wardrobe', '👗', '衣櫃'], ['shop', '🛒', '商店'], ['achievements', '🏆', '成就'],
  ];
  UI.renderTopbar = function () {
    const S = LC.Game.S;
    const lv = LC.Game.levelInfo(S.xp);
    const chests = Object.values(S.chests).reduce((a, b) => a + b, 0);
    const cur = (location.hash.slice(2).split('/')[0]) || 'home';
    UI.$('#topbar').innerHTML = `
      <a class="brand" href="#/home" aria-label="Leet Castle 首頁"><span class="brand-icon">🏰</span><span class="brand-name">Leet<b>Castle</b></span></a>
      <nav class="nav">${NAV.map(([id, ic, name]) => `<a href="#/${id}" class="nav-btn ${cur === id ? 'active' : ''}"><span class="nav-ic">${ic}</span><span class="nav-txt">${name}</span>${id === 'shop' && chests ? `<span class="badge">${chests}</span>` : ''}</a>`).join('')}</nav>
      <div class="top-right">
        <div class="lang-switch" role="group" aria-label="程式語言">
          ${Object.values(LC.LANGS).map((L) => `<button class="lang-btn ${S.lang === L.id ? 'on' : ''}" data-lang="${L.id}" title="${L.name}">${L.icon}<span>${L.short}</span></button>`).join('')}
        </div>
        <button class="pill lv" data-act="profile" title="${esc(lv.title)}"><span class="lv-num">Lv.${lv.level}</span><span class="xpbar"><i style="width:${Math.round((lv.cur / lv.need) * 100)}%"></i></span></button>
        <span class="pill coins" title="金幣">🪙 <b id="coin-count">${S.coins.toLocaleString()}</b></span>
      </div>`;
  };

  UI.setLang = function (lang) {
    const S = LC.Game.S;
    if (S.lang === lang) return;
    S.lang = lang;
    LC.Game.save();
    UI.renderTopbar();
    if (lang === 'python') LC.Runner.ensureLang('python', UI.pyStatus);
    UI.route();
    UI.toast(`已切換為 <b>${LC.LANGS[lang].name}</b>。每種語言的故事進度與成就是<b>各自獨立</b>的！`, 'info');
  };

  UI.pyStatus = function (st, msg) {
    const el = UI.$('#py-status');
    if (!el) return;
    if (st === 'loading') { el.className = 'py-status show'; el.innerHTML = '<span class="spin"></span> 正在載入 Python 引擎（首次約 5～20 秒）…'; }
    else if (st === 'ready') { el.className = 'py-status show ok'; el.innerHTML = '🐍 Python 引擎已就緒'; setTimeout(() => (el.className = 'py-status'), 1800); }
    else if (st === 'error') { el.className = 'py-status show err'; el.innerHTML = '⚠️ ' + esc(msg || 'Python 引擎載入失敗'); }
  };

  /* ---------------- router ---------------- */
  let current = null;
  UI.route = function () {
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    const name = parts[0] || 'home';
    const scr = UI.screens[name] || UI.screens.home;
    if (current && current.leave) { try { current.leave(); } catch (e) { /* ignore */ } }
    UI.closeModal(true);
    current = scr;
    const view = UI.$('#view');
    view.className = 'view view-' + name;
    view.innerHTML = '';
    scr.render(view, parts.slice(1));
    UI.renderTopbar();
    window.scrollTo(0, 0);
  };
  UI.go = (hash) => { if (location.hash === hash) UI.route(); else location.hash = hash; };

  UI.profile = function () {
    const S = LC.Game.S;
    const lv = LC.Game.levelInfo(S.xp);
    const m = UI.modal(`
      <h2>⚙️ 冒險者資料</h2>
      <div class="profile-grid">
        <div class="profile-av">${LC.Avatar.render(S.equip, S.look)}</div>
        <div>
          <label class="field">名字<input id="pf-name" maxlength="16" value="${esc(S.name)}"></label>
          <p>等級 <b>Lv.${lv.level}</b>・${esc(lv.title)}（${lv.cur}/${lv.need} XP）</p>
          <label class="check"><input type="checkbox" id="pf-sound" ${S.settings.sound ? 'checked' : ''}> 音效</label>
          <div class="stat-table">${Object.values(LC.LANGS).map((L) => {
            const st = S.stats[L.id] || {};
            const stars = Object.values(S.story[L.id] || {}).reduce((a, r) => a + (r.stars || 0), 0);
            return `<div class="stat-row"><b>${L.icon} ${L.name}</b><span>故事星星 ${stars}</span><span>挑戰解題 ${Object.keys(S.solved[L.id] || {}).length}</span><span>Hard ${st.hard || 0}</span></div>`;
          }).join('')}</div>
        </div>
      </div>
      <h3>存檔</h3>
      <p class="muted">進度儲存在這個瀏覽器中。可以匯出存檔碼備份，或在其他裝置匯入。</p>
      <div class="row gap wrap"><button class="btn" id="pf-export">📤 匯出存檔碼</button><button class="btn" id="pf-import">📥 匯入存檔碼</button><button class="btn danger" id="pf-reset">🗑️ 重置進度</button></div>
      <textarea id="pf-code" class="savecode" placeholder="存檔碼會出現在這裡，或把存檔碼貼在這裡再按匯入" rows="3"></textarea>
    `, { wide: true });
    m.querySelector('#pf-name').onchange = (e) => { S.name = e.target.value.trim() || '見習術士'; LC.Game.save(); UI.route(); };
    m.querySelector('#pf-sound').onchange = (e) => { S.settings.sound = e.target.checked; LC.Game.save(); };
    m.querySelector('#pf-export').onclick = () => { const t = m.querySelector('#pf-code'); t.value = LC.Game.exportSave(); t.select(); };
    m.querySelector('#pf-import').onclick = () => {
      try { LC.Game.importSave(m.querySelector('#pf-code').value); UI.closeModal(); UI.route(); UI.toast('存檔匯入成功！', 'good'); }
      catch (e) { UI.toast('匯入失敗：' + esc(e.message), 'bad'); }
    };
    m.querySelector('#pf-reset').onclick = async () => {
      if (await UI.confirm('<h3>確定要重置所有進度嗎？</h3><p>這會刪除所有語言的故事進度、服裝與成就，無法復原。</p>', '重置')) { LC.Game.reset(); UI.go('#/home'); UI.toast('進度已重置', 'info'); }
    };
  };

  /* ---------------- boot ---------------- */
  UI.boot = function () {
    LC.Game.load();
    LC.Game.on((type, data) => {
      if (type === 'levelup') { setTimeout(() => { UI.toast(`<div class="t-ach"><div class="t-ach-icon">🎉</div><div><div class="t-ach-label">等級提升！</div><b>Lv.${data.level}</b><div class="t-ach-reward">獎勵 ${data.coins} 金幣</div></div></div>`, 'ach', 4500); UI.sfx.win(); }, 1200); }
    });
    document.addEventListener('click', (e) => {
      const lb = e.target.closest('[data-lang]');
      if (lb && lb.closest('#topbar')) { UI.setLang(lb.dataset.lang); return; }
      if (e.target.closest('[data-act="profile"]')) UI.profile();
    });
    window.addEventListener('hashchange', UI.route);
    const login = LC.Game.dailyLogin();
    UI.route();
    if (LC.Game.S.lang === 'python') LC.Runner.ensureLang('python', UI.pyStatus);
    if (!LC.Game.S.introSeen) UI.screens.home.intro();
    else if (login) setTimeout(() => UI.toast(`☀️ 每日登入獎勵 <b>+${login.coins}</b> 金幣（連續 ${login.streak} 天）`, 'good', 4200), 500);
    setTimeout(UI.checkAch, 1500);
  };
})(typeof window !== 'undefined' ? window : globalThis);
