/*
 * Achievements. Language templates are instantiated once per language, so every language
 * unlocks its own set independently. Global achievements are shared.
 */
(function (root) {
  const LC = (root.LC = root.LC || {});

  const storyStars = (S, lang) => Object.values(S.story[lang] || {}).reduce((a, r) => a + (r.stars || 0), 0);
  const chapterDone = (S, lang, ch) => LC.Story.levels.filter((l) => l.ch === ch).every((l) => S.story[lang] && S.story[lang][l.id] && S.story[lang][l.id].cleared);
  const st = (S, lang, k) => ((S.stats[lang] || {})[k] || 0);
  const totalStars = () => LC.Story.levels.length * 3;

  const LANG_TEMPLATES = [
    { id: 'first-solve', icon: '🌱', name: '初試啼聲', desc: '解出第一道題目', max: 1, prog: (S, l) => st(S, l, 'solves'), reward: { coins: 100 } },
    { id: 'ch1', icon: '🚪', name: '城門突破', desc: '完成第一章「城門」', max: 1, prog: (S, l) => +chapterDone(S, l, 1), reward: { chest: 'bronze' } },
    { id: 'ch2', icon: '🌲', name: '森林行者', desc: '完成第二章「魔法森林」', max: 1, prog: (S, l) => +chapterDone(S, l, 2), reward: { chest: 'bronze' } },
    { id: 'ch3', icon: '⛰️', name: '山谷征服者', desc: '完成第三章「演算法山谷」', max: 1, prog: (S, l) => +chapterDone(S, l, 3), reward: { chest: 'gold' } },
    { id: 'ch4', icon: '🗼', name: '登塔者', desc: '完成第四章「遞迴之塔」', max: 1, prog: (S, l) => +chapterDone(S, l, 4), reward: { chest: 'gold' } },
    { id: 'ch5', icon: '👑', name: '城堡淨化者', desc: '擊敗蟲蟲魔王，完成故事模式', max: 1, prog: (S, l) => +chapterDone(S, l, 5), reward: { chest: 'diamond' } },
    { id: 'stars-30', icon: '⭐', name: '摘星者', desc: '在故事模式收集 30 顆星', max: 30, prog: (S, l) => storyStars(S, l), reward: { chest: 'gold' } },
    { id: 'stars-all', icon: '🌟', name: '完美主義者', desc: '故事模式全部三星', max: totalStars(), prog: (S, l) => storyStars(S, l), reward: { chest: 'diamond' } },
    { id: 'chal-5', icon: '⚔️', name: '挑戰者 I', desc: '在挑戰模式解出 5 題', max: 5, prog: (S, l) => st(S, l, 'chalSolves'), reward: { chest: 'bronze' } },
    { id: 'chal-20', icon: '🗡️', name: '挑戰者 II', desc: '在挑戰模式解出 20 題（不同題目）', max: 20, prog: (S, l) => Object.keys(S.solved[l] || {}).length, reward: { chest: 'gold' } },
    { id: 'chal-50', icon: '🏆', name: '挑戰者 III', desc: '在挑戰模式解出 50 題（不同題目）', max: 50, prog: (S, l) => Object.keys(S.solved[l] || {}).length, reward: { chest: 'diamond' } },
    { id: 'medium-1', icon: '🟡', name: '中級冒險者', desc: '解出第一道 Medium 題目', max: 1, prog: (S, l) => st(S, l, 'medium'), reward: { coins: 300 } },
    { id: 'hard-1', icon: '🔴', name: '傳說的開始', desc: '解出第一道 Hard 題目', max: 1, prog: (S, l) => st(S, l, 'hard'), reward: { chest: 'gold' } },
    { id: 'hard-5', icon: '🔥', name: '地獄征服者', desc: '解出 5 次 Hard 題目', max: 5, prog: (S, l) => st(S, l, 'hard'), reward: { chest: 'diamond' } },
    { id: 'opt-10', icon: '⏱️', name: '複雜度大師', desc: '10 次達到最佳時間複雜度', max: 10, prog: (S, l) => st(S, l, 'optTime'), reward: { chest: 'gold' } },
    { id: 'space-10', icon: '📦', name: '空間魔術師', desc: '10 次達到最佳空間複雜度', max: 10, prog: (S, l) => st(S, l, 'optSpace'), reward: { chest: 'bronze' } },
    { id: 'speed', icon: '⚡', name: '閃電俠', desc: '在 5 分鐘內解出一道 Medium 挑戰', max: 1, prog: (S, l) => st(S, l, 'fastMedium'), reward: { chest: 'gold' } },
    { id: 'first-try', icon: '🎯', name: '一發入魂', desc: '10 次第一次提交就通過', max: 10, prog: (S, l) => st(S, l, 'firstTry'), reward: { chest: 'bronze' } },
    { id: 's-grade', icon: '💎', name: 'S 級評價', desc: '在挑戰模式獲得 5 次 S 評價', max: 5, prog: (S, l) => st(S, l, 'sGrade'), reward: { chest: 'gold' } },
    { id: 'daily-3', icon: '📅', name: '每日修行', desc: '完成 3 次每日挑戰', max: 3, prog: (S, l) => st(S, l, 'daily'), reward: { chest: 'bronze' } },
  ];

  const GLOBAL = [
    { id: 'g-dress', icon: '👗', name: '換裝初體驗', desc: '在衣櫃中第一次更換裝備', max: 1, prog: (S) => S.global.dressed || 0, reward: { coins: 50 } },
    { id: 'g-chest-10', icon: '🎁', name: '開箱達人', desc: '開啟 10 個寶箱', max: 10, prog: (S) => S.global.chestsOpened || 0, reward: { coins: 300 } },
    { id: 'g-chest-50', icon: '🧰', name: '寶箱獵人', desc: '開啟 50 個寶箱', max: 50, prog: (S) => S.global.chestsOpened || 0, reward: { chest: 'diamond' } },
    { id: 'g-collect-20', icon: '🧥', name: '時尚達人', desc: '收集 20 件服裝', max: 20, prog: (S) => Object.keys(S.owned).length, reward: { chest: 'gold' } },
    { id: 'g-collect-all', icon: '🏰', name: '城堡衣帽間', desc: '收集全部服裝', max: () => LC.Items.ITEMS.length, prog: (S) => Object.keys(S.owned).length, reward: { coins: 3000 } },
    { id: 'g-legend', icon: '🌈', name: '傳說降臨', desc: '獲得第一件傳說服裝', max: 1, prog: (S) => +Object.keys(S.owned).some((id) => LC.Items.BY_ID[id] && LC.Items.BY_ID[id].rarity === 'legendary'), reward: { coins: 500 } },
    { id: 'g-bilingual', icon: '🌐', name: '雙語魔法師', desc: '用兩種語言解出同一道題目', max: 1, prog: (S) => +Object.keys(S.solved.javascript || {}).some((id) => S.solved.python && S.solved.python[id]) || +LC.Story.levels.some((l) => S.story.javascript[l.id] && S.story.javascript[l.id].cleared && S.story.python[l.id] && S.story.python[l.id].cleared), reward: { chest: 'gold' } },
    { id: 'g-polyglot', icon: '📜', name: '多語言學者', desc: '用兩種語言都完成第一章', max: 1, prog: (S) => +(chapterDone(S, 'javascript', 1) && chapterDone(S, 'python', 1)), reward: { chest: 'gold' } },
    { id: 'g-streak-3', icon: '🔥', name: '持之以恆', desc: '連續 3 天登入', max: 3, prog: (S) => S.global.streak || 0, reward: { chest: 'bronze' } },
    { id: 'g-streak-7', icon: '☀️', name: '修行一週', desc: '連續 7 天登入', max: 7, prog: (S) => S.global.streak || 0, reward: { chest: 'gold' } },
    { id: 'g-level-10', icon: '🎖️', name: '資深術士', desc: '玩家等級達到 10', max: 10, prog: (S) => LC.Game.levelInfo(S.xp).level, reward: { chest: 'gold' } },
  ];

  function all() {
    const out = [];
    for (const lang of Object.keys(LC.LANGS)) {
      for (const t of LANG_TEMPLATES) {
        out.push(Object.assign({}, t, { id: t.id + ':' + lang, tpl: t.id, lang, prog: (S) => t.prog(S, lang) }));
      }
    }
    for (const g of GLOBAL) out.push(Object.assign({}, g, { lang: null }));
    return out;
  }
  LC.Achievements = { LANG_TEMPLATES, GLOBAL, all, maxOf: (a) => (typeof a.max === 'function' ? a.max() : a.max) };
})(typeof window !== 'undefined' ? window : globalThis);
