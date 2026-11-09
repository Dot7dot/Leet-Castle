/* Screens: home, story map, challenge select, wardrobe, shop, achievements. */
(function (root) {
  const LC = (root.LC = root.LC || {});
  const UI = LC.UI;
  const esc = (s) => LC.util.esc(s);
  const G = () => LC.Game.S;
  const DIFF = { intro: ['入門', 'intro'], easy: ['Easy', 'easy'], medium: ['Medium', 'medium'], hard: ['Hard', 'hard'] };
  UI.DIFF = DIFF;
  const diffBadge = (d) => `<span class="diff ${DIFF[d][1]}">${DIFF[d][0]}</span>`;
  UI.diffBadge = diffBadge;

  function storyProgress(lang) {
    const S = G();
    const levels = LC.Story.levels;
    const rec = S.story[lang] || {};
    const cleared = levels.filter((l) => rec[l.id] && rec[l.id].cleared).length;
    const stars = levels.reduce((a, l) => a + ((rec[l.id] && rec[l.id].stars) || 0), 0);
    const next = levels.find((l) => !(rec[l.id] && rec[l.id].cleared));
    return { cleared, total: levels.length, stars, maxStars: levels.length * 3, next };
  }
  UI.storyProgress = storyProgress;
  function isUnlocked(lang, level) {
    const idx = LC.Story.levels.indexOf(level);
    if (idx <= 0) return true;
    const prev = LC.Story.levels[idx - 1];
    const r = G().story[lang][prev.id];
    return !!(r && r.cleared);
  }
  UI.isUnlocked = isUnlocked;

  /* =============================== HOME =============================== */
  UI.screens.home = {
    render(view) {
      const S = G();
      const lang = S.lang;
      const L = LC.LANGS[lang];
      const lv = LC.Game.levelInfo(S.xp);
      const sp = storyProgress(lang);
      const daily = LC.Game.dailyProblem();
      const dailyDone = !!S.global.daily[LC.Game.todayStr()];
      const chests = Object.values(S.chests).reduce((a, b) => a + b, 0);
      const achAll = LC.Achievements.all();
      const achDone = achAll.filter((a) => S.ach[a.id]).length;
      const solved = Object.keys(S.solved[lang] || {}).length;
      const pool = Object.values(LC.Problems).filter((p) => p.diff !== 'intro').length;
      const ch = sp.next ? LC.Story.chapters[sp.next.ch - 1] : LC.Story.chapters[4];
      view.innerHTML = `
        <section class="hero">
          <div class="hero-stage">
            <div class="stage-bg"></div>
            <div class="hero-avatar">${LC.Avatar.render(S.equip, S.look)}</div>
            <div class="hero-name"><b>${esc(S.name)}</b><span>Lv.${lv.level}・${esc(lv.title)}</span></div>
          </div>
          <div class="hero-info">
            <h1>歡迎回到 <span class="grad">Leet Castle</span></h1>
            <p class="lead">從零開始學 ${L.icon} <b>${L.name}</b>，一路挑戰到 Medium、Hard。解題、開寶箱、收集服裝，淨化被 Bug 詛咒的城堡！</p>
            <div class="quick">
              <a class="qcard q-story" href="${sp.next ? '#/play/story/' + sp.next.id : '#/story'}">
                <div class="qc-ic">📖</div><div class="qc-body"><b>${sp.next ? '繼續冒險' : '故事完成！'}</b>
                <span>${sp.next ? esc(ch.name) + '・' + esc(sp.next.concept) : '你已淨化整座城堡'}</span>
                <div class="bar"><i style="width:${(sp.cleared / sp.total) * 100}%"></i></div><small>${sp.cleared}/${sp.total} 關・⭐ ${sp.stars}/${sp.maxStars}</small></div>
              </a>
              <a class="qcard q-daily ${dailyDone ? 'done' : ''}" href="#/play/ch/${daily.id}?daily=1">
                <div class="qc-ic">📅</div><div class="qc-body"><b>每日挑戰 ${dailyDone ? '✔' : ''}</b><span>${esc(daily.title)} ${diffBadge(daily.diff)}</span><small>${dailyDone ? '今天已完成，明天再來！' : '首次完成可得 🎁 黃金寶箱 + 150 金幣'}</small></div>
              </a>
              <a class="qcard q-chal" href="#/challenge">
                <div class="qc-ic">⚔️</div><div class="qc-body"><b>挑戰模式</b><span>隨機題目・複雜度評分</span><small>已解出 ${solved}/${pool} 題（${L.name}）</small></div>
              </a>
              <a class="qcard q-shop" href="#/shop">
                <div class="qc-ic">🎁</div><div class="qc-body"><b>寶箱與商店</b><span>${chests ? `你有 <b>${chests}</b> 個寶箱還沒打開！` : '用金幣購買寶箱'}</span><small>🪙 ${S.coins.toLocaleString()}</small></div>
              </a>
              <a class="qcard q-wardrobe" href="#/wardrobe">
                <div class="qc-ic">👗</div><div class="qc-body"><b>衣櫃</b><span>自由搭配你的角色</span><small>收集 ${Object.keys(S.owned).length}/${LC.Items.ITEMS.length} 件</small></div>
              </a>
              <a class="qcard q-ach" href="#/achievements">
                <div class="qc-ic">🏆</div><div class="qc-body"><b>成就</b><span>每種語言各自解鎖</span><small>${achDone}/${achAll.length} 已解鎖</small></div>
              </a>
            </div>
          </div>
        </section>
        <section class="howto">
          <div class="how"><span>1</span><b>學</b>故事模式每關教一個概念，附 JS／Python 範例</div>
          <div class="how"><span>2</span><b>寫</b>在瀏覽器裡直接寫程式、執行、看輸出</div>
          <div class="how"><span>3</span><b>測</b>自動量測你的時間／空間複雜度</div>
          <div class="how"><span>4</span><b>玩</b>寶箱、服裝、成就、每日挑戰</div>
        </section>`;
    },
    intro() {
      const S = G();
      const m = UI.modal(`
        <div class="intro">
          <div class="intro-av">${LC.Avatar.render(S.equip, S.look, { mood: 'win' })}</div>
          <h2>📜 Leet Castle 的傳說</h2>
          <p>很久很久以前，有一座由程式碼構成的城堡。某天，<b>蟲蟲魔王</b>帶著無數 Bug 入侵，把城堡的守衛都變成了怪物……</p>
          <p>只有學會「程式魔法」的人，才能一層一層淨化城堡。你，就是新來的見習術士！</p>
          <label class="field">你的名字<input id="in-name" maxlength="16" value="${esc(S.name)}"></label>
          <div class="field">想從哪種語言開始學？<span class="muted">（之後隨時可以在右上角切換，每種語言的成就各自獨立）</span>
            <div class="lang-pick">
              ${Object.values(LC.LANGS).map((L) => `<button class="lang-card ${S.lang === L.id ? 'on' : ''}" data-pick="${L.id}"><span class="big">${L.icon}</span><b>${L.name}</b><small>${L.id === 'python' ? '語法簡潔，最適合初學者（首次載入需數秒）' : '網頁的語言，瀏覽器原生執行、速度最快'}</small></button>`).join('')}
            </div>
          </div>
          <p class="muted">🎁 見面禮：300 金幣 + 1 個木寶箱</p>
          <button class="btn primary big" id="in-go">⚔️ 開始冒險！</button>
        </div>`, { noClose: true, wide: true });
      m.querySelectorAll('[data-pick]').forEach((b) => (b.onclick = () => { m.querySelectorAll('[data-pick]').forEach((x) => x.classList.remove('on')); b.classList.add('on'); }));
      m.querySelector('#in-go').onclick = () => {
        S.name = m.querySelector('#in-name').value.trim() || '見習術士';
        const pick = m.querySelector('[data-pick].on');
        S.lang = pick ? pick.dataset.pick : 'javascript';
        S.introSeen = true;
        LC.Game.save();
        UI.closeModal();
        UI.sfx.win();
        if (S.lang === 'python') LC.Runner.ensureLang('python', UI.pyStatus);
        UI.go('#/story');
      };
    },
  };

  /* =============================== STORY MAP =============================== */
  UI.screens.story = {
    render(view) {
      const S = G();
      const lang = S.lang;
      const rec = S.story[lang];
      const sp = storyProgress(lang);
      view.innerHTML = `
        <div class="page-head"><h1>📖 故事模式 <small>${LC.LANGS[lang].icon} ${LC.LANGS[lang].name}</small></h1>
        <p class="muted">每一關教一個概念。⭐ 通過　⭐ 達到最佳時間複雜度　⭐ 失敗提交不超過 1 次</p>
        <div class="bar big"><i style="width:${(sp.cleared / sp.total) * 100}%"></i></div><small>${sp.cleared}/${sp.total} 關・⭐ ${sp.stars}/${sp.maxStars}</small></div>
        <div class="floors">${LC.Story.chapters.map((ch) => {
          const lvls = LC.Story.levels.filter((l) => l.ch === ch.id);
          const done = lvls.filter((l) => rec[l.id] && rec[l.id].cleared).length;
          const stars = lvls.reduce((a, l) => a + ((rec[l.id] && rec[l.id].stars) || 0), 0);
          const locked = !isUnlocked(lang, lvls[0]);
          return `<section class="floor bg-${ch.bg} ${locked ? 'locked' : ''}" style="--accent:${ch.color}">
            <div class="floor-head">
              <div class="floor-ic">${ch.icon}</div>
              <div><h2>${esc(ch.name)}</h2><p>${esc(ch.sub)}</p></div>
              <div class="floor-prog"><b>${done}/${lvls.length}</b><span>⭐ ${stars}/${lvls.length * 3}</span></div>
            </div>
            ${locked ? '<p class="floor-lock">🔒 完成上一層後解鎖</p>' : `<p class="floor-intro">${ch.intro}</p>`}
            <div class="path">${lvls.map((l, i) => {
              const r = rec[l.id];
              const un = isUnlocked(lang, l);
              const st = r ? r.stars : 0;
              const cls = r && r.cleared ? 'cleared' : un ? 'open' : 'locked';
              return `<a class="node ${cls} ${l.boss ? 'boss' : ''} ${sp.next === l ? 'current' : ''}" ${un ? `href="#/play/story/${l.id}"` : ''} title="${esc(l.concept)}">
                <span class="node-num">${l.boss ? '👑' : un ? l.id.split('-')[1] : '🔒'}</span>
                <span class="node-name">${esc(l.concept)}</span>
                <span class="node-stars">${[0, 1, 2].map((k) => `<i class="${k < st ? 'on' : ''}">★</i>`).join('')}</span>
                ${l.chest && !(r && r.cleared) ? `<span class="node-chest" title="首次通關獎勵：${LC.Items.CHESTS[l.chest].name}">${LC.Avatar.renderChest(l.chest)}</span>` : ''}
              </a>`;
            }).join('')}</div>
          </section>`;
        }).join('')}</div>`;
    },
  };
  function chestEmoji(t) { return { wood: '🟫', bronze: '🟧', gold: '🟨', diamond: '💎' }[t] || '🎁'; }
  UI.chestEmoji = chestEmoji;

  /* =============================== CHALLENGE =============================== */
  UI.screens.challenge = {
    filter: 'all',
    render(view) {
      const S = G();
      const lang = S.lang;
      const solved = S.solved[lang];
      const all = Object.values(LC.Problems).filter((p) => p.diff !== 'intro');
      const by = (d) => all.filter((p) => p.diff === d);
      const daily = LC.Game.dailyProblem();
      const dailyDone = !!S.global.daily[LC.Game.todayStr()];
      const cards = [
        ['easy', '🟢', '暖身題，熟悉基本資料結構', '木寶箱為主，S 評價有機會開出銅寶箱'],
        ['medium', '🟡', '面試主力，需要經典技巧', '銅寶箱為主，S 評價有機會開出黃金寶箱'],
        ['hard', '🔴', '頂尖挑戰，考驗演算法功力', '黃金寶箱為主，S 評價有機會開出💎鑽石寶箱'],
      ];
      const f = this.filter;
      view.innerHTML = `
        <div class="page-head"><h1>⚔️ 挑戰模式 <small>${LC.LANGS[lang].icon} ${LC.LANGS[lang].name}</small></h1>
        <p class="muted">選擇難度、挑戰隨機題目。通過後會分析你的<b>時間複雜度</b>、<b>空間複雜度</b>與<b>答題時間</b>並給出評價（S／A／B／C）。</p></div>
        <a class="daily-banner ${dailyDone ? 'done' : ''}" href="#/play/ch/${daily.id}?daily=1">
          <span class="db-ic">📅</span><div><b>今日挑戰：${esc(daily.title)}</b> ${diffBadge(daily.diff)}<br><small>${dailyDone ? '今天已完成 ✔ 明天會有新題目' : '首次完成獎勵：🎁 黃金寶箱 + 150 金幣'}</small></div><span class="btn primary">${dailyDone ? '再挑戰' : '挑戰！'}</span>
        </a>
        <div class="diff-cards">${cards.map(([d, ic, desc, drop]) => {
          const list = by(d);
          const n = list.filter((p) => solved[p.id]).length;
          return `<div class="diff-card ${d}">
            <div class="dc-top"><span class="dc-ic">${ic}</span><h2>${DIFF[d][0]}</h2></div>
            <p>${desc}</p>
            <div class="bar"><i style="width:${(n / list.length) * 100}%"></i></div><small>已解出 ${n}/${list.length}</small>
            <p class="drop">🎁 ${drop}</p>
            <button class="btn primary" data-rand="${d}">🎲 隨機挑戰</button>
          </div>`;
        }).join('')}</div>
        <div class="plist-head"><h2>📜 題目列表</h2>
          <div class="seg">${[['all', '全部'], ['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard'], ['todo', '未解'], ['done', '已解']].map(([k, n]) => `<button class="${f === k ? 'on' : ''}" data-filter="${k}">${n}</button>`).join('')}</div>
        </div>
        <div class="plist">${all.filter((p) => f === 'all' || p.diff === f || (f === 'todo' && !solved[p.id]) || (f === 'done' && solved[p.id])).map((p) => {
          const r = solved[p.id];
          return `<a class="prow ${r ? 'solved' : ''}" href="#/play/ch/${p.id}">
            <span class="pr-check">${r ? '✔' : ''}</span>
            <span class="pr-title">${p.lc ? `<small>#${p.lc}</small> ` : ''}${esc(p.title)}</span>
            <span class="pr-tags">${(p.tags || []).slice(0, 3).map((t) => `<i>${esc(t)}</i>`).join('')}</span>
            ${diffBadge(p.diff)}
            <span class="pr-grade">${r ? `<b class="grade g-${r.bestLetter}">${r.bestLetter}</b>` : ''}</span>
          </a>`;
        }).join('')}</div>`;
      view.querySelectorAll('[data-filter]').forEach((b) => (b.onclick = () => { this.filter = b.dataset.filter; this.render(view); }));
      view.querySelectorAll('[data-rand]').forEach((b) => (b.onclick = () => {
        const d = b.dataset.rand;
        const list = by(d);
        const fresh = list.filter((p) => !solved[p.id]);
        const pick = (fresh.length ? fresh : list)[Math.floor(Math.random() * (fresh.length ? fresh : list).length)];
        UI.sfx.click();
        UI.go('#/play/ch/' + pick.id);
      }));
    },
  };

  /* =============================== WARDROBE =============================== */
  UI.screens.wardrobe = {
    slot: 'hat',
    render(view) {
      const S = G();
      const I = LC.Items;
      const slot = this.slot;
      const items = I.ITEMS.filter((i) => i.slot === slot).sort((a, b) => I.RARITY[a.rarity].order - I.RARITY[b.rarity].order);
      const required = ['hair', 'top', 'bottom', 'shoes'].includes(slot);
      const owned = Object.keys(S.owned).length;
      view.innerHTML = `
        <div class="page-head"><h1>👗 衣櫃</h1><p class="muted">寶箱開出的服裝會出現在這裡。收集進度 <b>${owned}/${I.ITEMS.length}</b></p></div>
        <div class="wardrobe">
          <div class="wd-preview">
            <div class="wd-stage">${LC.Avatar.render(S.equip, S.look)}</div>
            <div class="wd-look">
              <div><span>膚色</span>${I.SKINS.map((c, i) => `<button class="swatch ${S.look.skin === i ? 'on' : ''}" style="background:${c}" data-skin="${i}" aria-label="膚色 ${i + 1}"></button>`).join('')}</div>
              <div><span>瞳色</span>${I.EYES.map((c, i) => `<button class="swatch ${S.look.eyes === i ? 'on' : ''}" style="background:${c}" data-eyes="${i}" aria-label="瞳色 ${i + 1}"></button>`).join('')}</div>
            </div>
          </div>
          <div class="wd-right">
            <div class="slot-tabs">${I.SLOTS.map((s) => {
              const tot = I.ITEMS.filter((i) => i.slot === s.id).length;
              const own = I.ITEMS.filter((i) => i.slot === s.id && S.owned[i.id]).length;
              return `<button class="slot-tab ${slot === s.id ? 'on' : ''}" data-slot="${s.id}"><span>${s.icon}</span>${s.name}<small>${own}/${tot}</small></button>`;
            }).join('')}</div>
            <div class="item-grid">
              ${required ? '' : `<button class="item-card none ${!S.equip[slot] ? 'equipped' : ''}" data-unequip="${slot}"><div class="ic-img">🚫</div><div class="ic-name">不裝備</div></button>`}
              ${items.map((it) => {
                const own = !!S.owned[it.id];
                const eq = S.equip[slot] === it.id;
                const R = I.RARITY[it.rarity];
                return `<button class="item-card r-${it.rarity} ${own ? '' : 'unowned'} ${eq ? 'equipped' : ''}" ${own ? `data-equip="${it.id}"` : ''} style="--rc:${R.color}" title="${own ? esc(it.name) : '尚未取得：從寶箱中獲得'}">
                  <div class="ic-img">${LC.Avatar.renderItem(it)}${own ? '' : '<span class="q">?</span>'}</div>
                  <div class="ic-name">${own ? esc(it.name) : '？？？'}</div>
                  <div class="ic-r" style="color:${R.color}">${R.name}</div>
                  ${eq ? '<span class="ic-eq">裝備中</span>' : ''}
                </button>`;
              }).join('')}
            </div>
          </div>
        </div>`;
      view.querySelectorAll('[data-slot]').forEach((b) => (b.onclick = () => { this.slot = b.dataset.slot; UI.sfx.click(); this.render(view); }));
      const dressed = () => { S.global.dressed = 1; LC.Game.save(); UI.checkAch(); };
      view.querySelectorAll('[data-equip]').forEach((b) => (b.onclick = () => { S.equip[slot] = b.dataset.equip; UI.sfx.click(); dressed(); this.render(view); }));
      view.querySelectorAll('[data-unequip]').forEach((b) => (b.onclick = () => { delete S.equip[slot]; UI.sfx.click(); dressed(); this.render(view); }));
      view.querySelectorAll('[data-skin]').forEach((b) => (b.onclick = () => { S.look.skin = +b.dataset.skin; LC.Game.save(); this.render(view); }));
      view.querySelectorAll('[data-eyes]').forEach((b) => (b.onclick = () => { S.look.eyes = +b.dataset.eyes; LC.Game.save(); this.render(view); }));
    },
  };

  /* =============================== SHOP / CHESTS =============================== */
  UI.screens.shop = {
    render(view) {
      const S = G();
      const I = LC.Items;
      view.innerHTML = `
        <div class="page-head"><h1>🛒 寶箱商店</h1><p class="muted">寶箱會隨機開出服裝。越高級的寶箱，越容易開出稀有服裝！重複的服裝會自動轉換成金幣。</p></div>
        <h2 class="sec">🎁 我的寶箱</h2>
        <div class="my-chests">${I.CHEST_ORDER.map((t) => `
          <div class="mychest ${S.chests[t] ? 'has' : ''}">
            <div class="mc-img ${S.chests[t] ? 'anim-wiggle' : ''}">${LC.Avatar.renderChest(t)}</div>
            <b>${I.CHESTS[t].name}</b><span class="count">× ${S.chests[t] || 0}</span>
            <button class="btn ${S.chests[t] ? 'primary' : ''}" data-open="${t}" ${S.chests[t] ? '' : 'disabled'}>打開</button>
          </div>`).join('')}</div>
        <h2 class="sec">🪙 購買寶箱 <small>你有 ${S.coins.toLocaleString()} 金幣</small></h2>
        <div class="shop-grid">${I.CHEST_ORDER.map((t) => {
          const C = I.CHESTS[t];
          return `<div class="shop-card c-${t}">
            <div class="sc-img">${LC.Avatar.renderChest(t)}</div>
            <h3>${C.name}</h3>
            <p class="muted">${C.items} 件服裝 + ${C.coins[0]}～${C.coins[1]} 金幣</p>
            <div class="odds">${['common', 'rare', 'epic', 'legendary'].map((r) => `<div><span style="color:${I.RARITY[r].color}">● ${I.RARITY[r].name}</span><b>${C.odds[r]}%</b></div>`).join('')}</div>
            <button class="btn primary" data-buy="${t}" ${S.coins < C.price ? 'disabled' : ''}>🪙 ${C.price.toLocaleString()}</button>
          </div>`;
        }).join('')}</div>
        <p class="muted center">💡 故事關卡首次通關、挑戰模式高評價、成就與每日挑戰都能獲得寶箱。越難的題目越容易掉落高級寶箱！</p>`;
      view.querySelectorAll('[data-buy]').forEach((b) => (b.onclick = () => {
        if (LC.Game.buyChest(b.dataset.buy)) { UI.sfx.coin(); UI.toast(`購買了 <b>${I.CHESTS[b.dataset.buy].name}</b>！`, 'good'); this.render(view); UI.renderTopbar(); }
      }));
      view.querySelectorAll('[data-open]').forEach((b) => (b.onclick = () => UI.openChestFlow(b.dataset.open, () => { this.render(view); UI.renderTopbar(); })));
    },
  };

  /** Chest opening ceremony: tap to shake 3 times, then burst and reveal items one by one. */
  UI.openChestFlow = function (type, done) {
    const I = LC.Items;
    if (!G().chests[type]) return;
    let taps = 0;
    const m = UI.modal(`<div class="chest-open">
      <h2>${I.CHESTS[type].name}</h2>
      <div class="co-stage"><div class="co-rays"></div><div class="co-chest" id="co-chest">${LC.Avatar.renderChest(type)}</div></div>
      <p class="muted" id="co-hint">點擊寶箱打開它！（${3 - taps}）</p>
      <div class="co-items" id="co-items"></div>
      <div class="row center gap" id="co-btns"></div>
    </div>`, { wide: true, cls: 'chest-modal', onClose: done });
    const chest = m.querySelector('#co-chest');
    chest.onclick = () => {
      if (taps >= 3) return;
      taps++;
      UI.sfx.shake();
      chest.classList.remove('shake'); void chest.offsetWidth; chest.classList.add('shake');
      m.querySelector('#co-hint').textContent = taps < 3 ? `再點 ${3 - taps} 下！` : '';
      if (taps === 3) setTimeout(reveal, 450);
    };
    function reveal() {
      const res = LC.Game.openChest(type);
      if (!res) return;
      const best = res.items.reduce((b, x) => Math.max(b, I.RARITY[I.BY_ID[x.id].rarity].order), 0);
      m.querySelector('.co-stage').classList.add('opened', 'r' + best);
      chest.innerHTML = LC.Avatar.renderChest(type, { open: true });
      if (best >= 3) UI.sfx.legendary(); else UI.sfx.open();
      if (best >= 2) UI.confetti(best >= 3 ? 140 : 60);
      const box = m.querySelector('#co-items');
      res.items.forEach((x, i) => {
        const it = I.BY_ID[x.id];
        const R = I.RARITY[it.rarity];
        setTimeout(() => {
          const d = document.createElement('div');
          d.className = 'co-item r-' + it.rarity;
          d.style.setProperty('--rc', R.color);
          d.innerHTML = `<div class="ci-img">${LC.Avatar.renderItem(it)}</div><b>${esc(it.name)}</b><span style="color:${R.color}">${R.name}・${I.SLOTS.find((s) => s.id === it.slot).name}</span>${x.dup ? `<small class="dup">已擁有 → 🪙 +${x.refund}</small>` : '<small class="new">NEW!</small>'}`;
          box.appendChild(d);
        }, 350 + i * 450);
      });
      setTimeout(() => {
        m.querySelector('#co-btns').innerHTML = `<span class="pill">🪙 +${res.coins}</span>${G().chests[type] ? `<button class="btn" id="co-again">再開一個（剩 ${G().chests[type]}）</button>` : ''}<a class="btn primary" href="#/wardrobe" data-close>去衣櫃換裝 👗</a>`;
        const again = m.querySelector('#co-again');
        if (again) again.onclick = () => { UI.closeModal(true); UI.openChestFlow(type, done); };
        UI.renderTopbar();
        UI.checkAch();
      }, 400 + res.items.length * 450);
    }
  };

  /* =============================== ACHIEVEMENTS =============================== */
  UI.screens.achievements = {
    tab: null,
    render(view) {
      const S = G();
      const tab = this.tab || S.lang;
      const all = LC.Achievements.all();
      const list = all.filter((a) => (tab === 'global' ? !a.lang : a.lang === tab));
      const cnt = (pred) => all.filter((a) => pred(a) && S.ach[a.id]).length + '/' + all.filter(pred).length;
      view.innerHTML = `
        <div class="page-head"><h1>🏆 成就</h1><p class="muted">使用不同的程式語言，會<b>各自獨立</b>解鎖成就。用 Python 再挑戰一次，又是全新的旅程！</p></div>
        <div class="seg big">${Object.values(LC.LANGS).map((L) => `<button class="${tab === L.id ? 'on' : ''}" data-tab="${L.id}">${L.icon} ${L.name} <small>${cnt((a) => a.lang === L.id)}</small></button>`).join('')}<button class="${tab === 'global' ? 'on' : ''}" data-tab="global">🌐 共通 <small>${cnt((a) => !a.lang)}</small></button></div>
        <div class="ach-grid">${list.map((a) => {
          const max = LC.Achievements.maxOf(a);
          let cur = 0; try { cur = Math.min(max, a.prog(S)); } catch (e) { cur = 0; }
          const done = !!S.ach[a.id];
          const reward = a.reward.chest ? chestEmoji(a.reward.chest) + ' ' + LC.Items.CHESTS[a.reward.chest].name : '🪙 ' + a.reward.coins;
          return `<div class="ach ${done ? 'done' : ''}">
            <div class="ach-ic">${a.icon}</div>
            <div class="ach-body"><b>${esc(a.name)}</b><p>${esc(a.desc)}</p>
            <div class="bar"><i style="width:${(cur / max) * 100}%"></i></div>
            <small>${done ? '✔ 已解鎖・' + new Date(S.ach[a.id]).toLocaleDateString() : cur + ' / ' + max}</small></div>
            <div class="ach-reward">${reward}</div>
          </div>`;
        }).join('')}</div>`;
      view.querySelectorAll('[data-tab]').forEach((b) => (b.onclick = () => { this.tab = b.dataset.tab; this.render(view); }));
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
