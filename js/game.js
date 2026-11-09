/* Game state, economy, rewards, grading. Persisted in localStorage. */
(function (root) {
  const LC = (root.LC = root.LC || {});
  const KEY = 'leetcastle_save_v1';
  const listeners = [];

  function fresh() {
    const owned = {};
    LC.Items.STARTERS.forEach((id) => (owned[id] = 1));
    return {
      v: 1,
      name: '見習術士',
      lang: 'javascript',
      coins: 300,
      xp: 0,
      look: { skin: 0, eyes: 0 },
      equip: Object.assign({}, LC.Items.DEFAULT_EQUIP),
      owned,
      chests: { wood: 1, bronze: 0, gold: 0, diamond: 0 },
      story: { javascript: {}, python: {} },
      solved: { javascript: {}, python: {} },
      stats: { javascript: {}, python: {} },
      code: {},
      ach: {},
      global: { chestsOpened: 0, streak: 0, lastLogin: null, daily: {} },
      settings: { sound: true },
      introSeen: false,
    };
  }

  let S = null;
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        S = Object.assign(fresh(), d);
        for (const k of ['story', 'solved', 'stats']) for (const l of Object.keys(LC.LANGS)) S[k][l] = S[k][l] || {};
        S.global = Object.assign(fresh().global, S.global || {});
        S.chests = Object.assign(fresh().chests, S.chests || {});
        return S;
      }
    } catch (e) { /* ignore broken saves */ }
    S = fresh();
    return S;
  }
  let saveTimer = null;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage full or blocked */ } }, 150);
  }
  function emit(type, data) { listeners.forEach((f) => f(type, data)); }

  /* ---------------- level / xp ---------------- */
  const TITLES = [[1, '見習術士'], [3, '程式學徒'], [6, '演算法騎士'], [10, '資料結構法師'], [15, '複雜度賢者'], [20, '城堡之主']];
  function levelInfo(xp) {
    let level = 1, need = 120, rest = xp;
    while (rest >= need) { rest -= need; level++; need = 120 + (level - 1) * 60; }
    let title = TITLES[0][1];
    for (const [lv, t] of TITLES) if (level >= lv) title = t;
    return { level, cur: rest, need, title };
  }
  function addXp(n) {
    const before = levelInfo(S.xp).level;
    S.xp += n;
    const after = levelInfo(S.xp).level;
    if (after > before) {
      S.coins += 100 * (after - before);
      emit('levelup', { level: after, coins: 100 * (after - before) });
    }
  }
  function addCoins(n) { S.coins += n; emit('coins', S.coins); }
  function grantChest(type, n) { S.chests[type] = (S.chests[type] || 0) + (n || 1); emit('chest', type); }

  /* ---------------- chests ---------------- */
  function rollRarity(odds) {
    const total = Object.values(odds).reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (const k of ['common', 'rare', 'epic', 'legendary']) { r -= odds[k] || 0; if (r < 0) return k; }
    return 'common';
  }
  function openChest(type) {
    if (!S.chests[type]) return null;
    const C = LC.Items.CHESTS[type];
    S.chests[type]--;
    S.global.chestsOpened = (S.global.chestsOpened || 0) + 1;
    const pool = LC.Items.ITEMS.filter((i) => !i.starter);
    const items = [];
    for (let k = 0; k < C.items; k++) {
      const rar = rollRarity(C.odds);
      const cands = pool.filter((i) => i.rarity === rar);
      // prefer items the player doesn't own yet (60% of the time) to keep collecting exciting
      const fresh = cands.filter((i) => !S.owned[i.id] && !items.some((x) => x.id === i.id));
      const pickFrom = fresh.length && Math.random() < 0.6 ? fresh : cands;
      const it = pickFrom[Math.floor(Math.random() * pickFrom.length)];
      const dup = !!S.owned[it.id] || items.some((x) => x.id === it.id);
      if (dup) S.coins += LC.Items.RARITY[it.rarity].dup;
      else S.owned[it.id] = 1;
      items.push({ id: it.id, dup, refund: dup ? LC.Items.RARITY[it.rarity].dup : 0 });
    }
    const coins = C.coins[0] + Math.floor(Math.random() * (C.coins[1] - C.coins[0] + 1));
    S.coins += coins;
    save();
    return { items, coins };
  }
  function buyChest(type) {
    const C = LC.Items.CHESTS[type];
    if (S.coins < C.price) return false;
    S.coins -= C.price;
    grantChest(type);
    save();
    return true;
  }

  /* ---------------- grading ---------------- */
  const TARGET_MIN = { intro: 8, easy: 12, medium: 25, hard: 40 };
  function grade(P, analysis, ms, fails, hints, cxOverride) {
    const C = LC.Complexity;
    const cx = P.cx;
    let tOpt = true, sOpt = true, tGap = 0, sGap = 0;
    const optTime = (cxOverride && cxOverride.time) || (cx && cx.time);
    if (cx && analysis && !analysis.error) {
      tGap = Math.max(0, C.INDEX[analysis.time] - C.INDEX[optTime]);
      sGap = Math.max(0, C.INDEX[analysis.space] - C.INDEX[cx.space]);
      tOpt = tGap === 0; sOpt = sGap === 0;
    }
    const tPts = tGap === 0 ? 40 : tGap === 1 ? 22 : 8;
    const sPts = sGap === 0 ? 20 : sGap === 1 ? 12 : 5;
    const target = TARGET_MIN[P.diff] * 60000;
    const sp = ms <= target / 2 ? 25 : ms <= target ? 19 : ms <= target * 2 ? 12 : 6;
    const tries = fails === 0 ? 15 : fails <= 2 ? 9 : 4;
    let score = tPts + sPts + sp + tries - (hints || 0) * 4;
    score = Math.max(10, Math.min(100, score));
    const letter = score >= 90 ? 'S' : score >= 75 ? 'A' : score >= 60 ? 'B' : 'C';
    return { score, letter, tOpt, sOpt, tGap, sGap, breakdown: { time: tPts, space: sPts, speed: sp, tries, hints: -(hints || 0) * 4 }, targetMs: target };
  }

  const CHAL_COINS = { easy: 70, medium: 140, hard: 280, intro: 40 };
  const MULT = { S: 1.5, A: 1.2, B: 1.0, C: 0.8 };
  const DROPS = {
    easy: { S: [['bronze', 0.5], ['wood', 1]], A: [['wood', 0.75]], B: [['wood', 0.45]], C: [['wood', 0.25]] },
    medium: { S: [['gold', 0.35], ['bronze', 1]], A: [['bronze', 0.7], ['wood', 1]], B: [['bronze', 0.4], ['wood', 0.8]], C: [['wood', 0.5]] },
    hard: { S: [['diamond', 0.25], ['gold', 1]], A: [['gold', 0.55], ['bronze', 1]], B: [['gold', 0.3], ['bronze', 0.8]], C: [['bronze', 0.6]] },
  };
  function rollDrop(diff, letter, repeat) {
    const table = (DROPS[diff] || DROPS.easy)[letter] || [];
    for (const [type, p] of table) if (Math.random() < p * (repeat ? 0.4 : 1)) return type;
    return null;
  }

  function bumpStats(lang, P, g, ms, fails, isChallenge) {
    const st = S.stats[lang];
    const inc = (k, n) => (st[k] = (st[k] || 0) + (n || 1));
    inc('solves');
    if (P.diff === 'medium') inc('medium');
    if (P.diff === 'hard') inc('hard');
    if (g.tOpt && P.cx) inc('optTime');
    if (g.sOpt && P.cx) inc('optSpace');
    if (fails === 0) inc('firstTry');
    if (isChallenge) {
      inc('chalSolves');
      if (g.letter === 'S') inc('sGrade');
      if (P.diff === 'medium' && ms <= 5 * 60000) st.fastMedium = 1;
    }
  }

  /** Called when a story level is cleared. Returns the reward summary. */
  function completeStory(level, lang, P, verdict, ms, fails, hints) {
    const rec = S.story[lang][level.id] || {};
    const first = !rec.cleared;
    const g = grade(P, verdict.analysis, ms, fails, hints, { time: level.cxTime });
    const starOpt = g.tOpt;
    const starClean = fails <= 1;
    const prevStars = rec.stars || 0;
    rec.cleared = true;
    rec.optimal = rec.optimal || starOpt;
    rec.clean = rec.clean || starClean;
    rec.stars = 1 + (rec.optimal ? 1 : 0) + (rec.clean ? 1 : 0);
    rec.bestMs = rec.bestMs ? Math.min(rec.bestMs, ms) : ms;
    S.story[lang][level.id] = rec;
    const ch = level.ch;
    let coins = 0, xp = 0, chest = null;
    if (first) {
      coins = 40 + ch * 12 + (level.boss ? 80 : 0);
      xp = 35 + ch * 12 + (level.boss ? 60 : 0);
      chest = level.chest || 'wood';
      grantChest(chest);
    } else {
      coins = 10; xp = 10;
    }
    if (rec.stars === 3 && prevStars < 3) coins += 50;
    addCoins(coins); addXp(xp);
    bumpStats(lang, P, g, ms, fails, false);
    save();
    return { first, stars: rec.stars, prevStars, starOpt, starClean, coins, xp, chest, grade: g };
  }

  /** Called when a challenge problem is solved. */
  function completeChallenge(P, lang, verdict, ms, fails, hints, daily) {
    const g = grade(P, verdict.analysis, ms, fails, hints);
    const prev = S.solved[lang][P.id];
    const repeat = !!prev;
    let coins = Math.round((CHAL_COINS[P.diff] || 60) * MULT[g.letter] * (repeat ? 0.35 : 1));
    let xp = Math.round((CHAL_COINS[P.diff] || 60) * 0.8 * MULT[g.letter] * (repeat ? 0.35 : 1));
    let chest = rollDrop(P.diff, g.letter, repeat);
    let dailyChest = null;
    const today = todayStr();
    if (daily && !S.global.daily[today]) {
      S.global.daily[today] = lang;
      dailyChest = 'gold';
      coins += 150;
      (S.stats[lang].daily = (S.stats[lang].daily || 0) + 1);
    }
    if (chest) grantChest(chest);
    if (dailyChest) grantChest(dailyChest);
    const rec = prev || { count: 0, bestScore: 0 };
    rec.count++;
    if (g.score >= (rec.bestScore || 0)) {
      rec.bestScore = g.score;
      rec.bestLetter = g.letter;
      rec.time = verdict.analysis && verdict.analysis.time;
      rec.space = verdict.analysis && verdict.analysis.space;
    }
    rec.bestMs = rec.bestMs ? Math.min(rec.bestMs, ms) : ms;
    rec.date = Date.now();
    S.solved[lang][P.id] = rec;
    addCoins(coins); addXp(xp);
    bumpStats(lang, P, g, ms, fails, true);
    save();
    return { grade: g, coins, xp, chest, dailyChest, repeat };
  }

  /* ---------------- achievements ---------------- */
  function checkAchievements() {
    const unlocked = [];
    for (const a of LC.Achievements.all()) {
      if (S.ach[a.id]) continue;
      let cur = 0;
      try { cur = a.prog(S); } catch (e) { cur = 0; }
      if (cur >= LC.Achievements.maxOf(a)) {
        S.ach[a.id] = Date.now();
        if (a.reward.coins) S.coins += a.reward.coins;
        if (a.reward.chest) S.chests[a.reward.chest] = (S.chests[a.reward.chest] || 0) + 1;
        unlocked.push(a);
      }
    }
    if (unlocked.length) save();
    return unlocked;
  }

  /* ---------------- daily ---------------- */
  function todayStr(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function dailyLogin() {
    const today = todayStr();
    if (S.global.lastLogin === today) return null;
    const y = new Date(); y.setDate(y.getDate() - 1);
    S.global.streak = S.global.lastLogin === todayStr(y) ? (S.global.streak || 0) + 1 : 1;
    S.global.lastLogin = today;
    const coins = 60 + Math.min(7, S.global.streak) * 20;
    S.coins += coins;
    save();
    return { coins, streak: S.global.streak };
  }
  function dailyProblem() {
    const pool = Object.values(LC.Problems).filter((p) => p.diff === 'medium' || p.diff === 'easy');
    const h = LC.util.hashStr('daily-' + todayStr());
    return pool[h % pool.length];
  }

  function exportSave() { return btoa(unescape(encodeURIComponent(JSON.stringify(S)))); }
  function importSave(str) {
    const d = JSON.parse(decodeURIComponent(escape(atob(str.trim()))));
    if (!d || typeof d !== 'object' || !d.story) throw new Error('存檔格式不正確');
    localStorage.setItem(KEY, JSON.stringify(d));
    load();
  }
  function reset() { localStorage.removeItem(KEY); load(); }

  LC.Game = {
    load, save, get S() { return S; }, on: (f) => listeners.push(f),
    levelInfo, addXp, addCoins, grantChest, openChest, buyChest, grade, completeStory, completeChallenge,
    checkAchievements, dailyLogin, dailyProblem, todayStr, exportSave, importSave, reset, TARGET_MIN,
  };
})(typeof window !== 'undefined' ? window : globalThis);
