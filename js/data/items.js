/*
 * Cosmetics + the chibi (3-head-tall) avatar renderer.
 * Every item contributes SVG to one or more layers. Layers are drawn in LAYER_ORDER.
 */
(function (root) {
  const LC = (root.LC = root.LC || {});
  const O = '#3b2a20'; // outline
  // the character and all cosmetics are drawn without outlines (flat style); chests keep theirs
  const SW = '';
  const CSW = 'stroke="' + O + '" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"';
  let uid = 0;

  const RARITY = {
    common: { name: '普通', color: '#94a3b8', order: 0, dup: 25 },
    rare: { name: '稀有', color: '#3b82f6', order: 1, dup: 60 },
    epic: { name: '史詩', color: '#a855f7', order: 2, dup: 150 },
    legendary: { name: '傳說', color: '#f59e0b', order: 3, dup: 400 },
  };
  const SLOTS = [
    { id: 'hat', name: '頭飾', icon: '🎩' },
    { id: 'hair', name: '髮型', icon: '💇' },
    { id: 'face', name: '臉飾', icon: '🕶️' },
    { id: 'top', name: '上衣', icon: '👕' },
    { id: 'bottom', name: '下身', icon: '👖' },
    { id: 'shoes', name: '鞋子', icon: '👟' },
    { id: 'hand', name: '手持', icon: '🗡️' },
    { id: 'back', name: '背飾', icon: '🪽' },
    { id: 'pet', name: '寵物', icon: '🐣' },
  ];
  const SKINS = ['#ffe0c7', '#f7cfa8', '#e0a878', '#a86f48', '#6f4630'];
  const EYES = ['#2b2b3a', '#3b6fd6', '#2f9e5d', '#b5462e', '#8b45d6'];

  const shade = (hex, amt) => {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
    r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  };
  const sparkle = (x, y, s, c, delay) => `<path class="anim-twinkle" style="animation-delay:${delay || 0}s" d="M${x} ${y - s} L${x + s * 0.3} ${y - s * 0.3} L${x + s} ${y} L${x + s * 0.3} ${y + s * 0.3} L${x} ${y + s} L${x - s * 0.3} ${y + s * 0.3} L${x - s} ${y} L${x - s * 0.3} ${y - s * 0.3}Z" fill="${c || '#fff7c2'}"/>`;

  /* ---------------- hair helpers ---------------- */
  const hairBackShort = (c) => `<path d="M52 80 Q48 26 100 22 Q152 26 148 80 Q150 108 140 118 L60 118 Q50 108 52 80Z" fill="${c}" ${SW}/>`;
  const bangs = (c) => `<path d="M53 76 Q54 28 100 26 Q146 28 147 76 Q138 58 120 56 Q112 44 100 54 Q88 44 78 58 Q62 58 53 76Z" fill="${c}" ${SW}/><path d="M74 38 Q86 32 98 34" stroke="${shade(c, 50)}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".6"/>`;

  const ITEMS = [];
  const def = (o) => { ITEMS.push(o); return o; };

  /* ================= HAIR ================= */
  const hairShort = (id, name, rarity, c, starter) => def({ id, slot: 'hair', name, rarity, starter, layers: { hairBack: hairBackShort(c), hairFront: bangs(c) } });
  hairShort('hair-brown', '清爽短髮・栗', 'common', '#7a4a2a', true);
  hairShort('hair-black', '清爽短髮・墨', 'common', '#2a2430');
  hairShort('hair-mint', '清爽短髮・薄荷', 'rare', '#5cc9a7');
  def({
    id: 'hair-ponytail', slot: 'hair', name: '活力馬尾', rarity: 'common',
    layers: {
      hairBack: `<path d="M140 70 Q176 76 168 128 Q164 150 150 158 Q160 124 142 96Z" fill="#2a2430" ${SW}/>` + hairBackShort('#2a2430'),
      hairFront: bangs('#2a2430') + `<circle cx="146" cy="72" r="5" fill="#ff6b8a" ${SW}/>`,
    },
  });
  def({
    id: 'hair-twintails', slot: 'hair', name: '甜心雙馬尾', rarity: 'rare',
    layers: {
      hairBack: `<path d="M56 64 Q20 76 26 130 Q30 156 44 166 Q38 128 58 98Z" fill="#ff8fb8" ${SW}/><path d="M144 64 Q180 76 174 130 Q170 156 156 166 Q162 128 142 98Z" fill="#ff8fb8" ${SW}/>` + hairBackShort('#ff8fb8'),
      hairFront: bangs('#ff8fb8') + `<circle cx="56" cy="62" r="6" fill="#fff36b" ${SW}/><circle cx="144" cy="62" r="6" fill="#fff36b" ${SW}/>`,
    },
  });
  def({
    id: 'hair-spiky', slot: 'hair', name: '熱血刺蝟頭', rarity: 'rare',
    layers: {
      hairBack: `<path d="M50 84 L38 60 L56 54 L48 26 L72 34 L76 8 L96 24 L112 4 L120 28 L144 14 L142 40 L166 44 L150 62 L160 84 Q148 112 140 118 L60 118 Q48 104 50 84Z" fill="#ffd23f" ${SW}/>`,
      hairFront: `<path d="M53 74 L60 44 L72 58 L80 34 L92 54 L102 30 L112 54 L124 36 L128 58 L142 46 L147 74 Q132 60 100 58 Q70 60 53 74Z" fill="#ffd23f" ${SW}/>`,
    },
  });
  def({
    id: 'hair-long-silver', slot: 'hair', name: '月光長髮', rarity: 'epic',
    layers: {
      hairBack: `<path d="M50 80 Q44 22 100 20 Q156 22 150 80 L156 180 Q140 192 124 184 L120 120 L80 120 L76 184 Q60 192 44 180Z" fill="#d9dff0" ${SW}/>`,
      hairFront: bangs('#d9dff0') + `<path d="M54 74 Q50 110 58 140" stroke="#d9dff0" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M146 74 Q150 110 142 140" stroke="#d9dff0" stroke-width="10" fill="none" stroke-linecap="round"/>` + sparkle(70, 34, 5, '#ffffff', 0.4),
    },
  });
  def({
    id: 'hair-buns', slot: 'hair', name: '雙丸子頭', rarity: 'epic',
    layers: {
      hairBack: `<circle cx="62" cy="30" r="20" fill="#4f7cff" ${SW}/><circle cx="138" cy="30" r="20" fill="#4f7cff" ${SW}/>` + hairBackShort('#4f7cff'),
      hairFront: bangs('#4f7cff') + `<path d="M50 24 Q62 16 74 24" stroke="#ffd1e8" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M126 24 Q138 16 150 24" stroke="#ffd1e8" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    },
  });
  def({
    id: 'hair-galaxy', slot: 'hair', name: '星河長髮', rarity: 'legendary',
    layers: (u) => ({
      defs: `<linearGradient id="gal${u}" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="#7c3aed"/><stop offset=".5" stop-color="#2563eb"/><stop offset="1" stop-color="#ec4899"/></linearGradient>`,
      hairBack: `<path d="M48 80 Q42 18 100 16 Q158 18 152 80 L162 196 Q140 208 122 196 L120 120 L80 120 L78 196 Q60 208 38 196Z" fill="url(#gal${u})" ${SW}/>` + sparkle(52, 160, 6, '#fff', 0) + sparkle(150, 176, 5, '#fff', 0.7) + sparkle(146, 120, 4, '#fff', 1.2),
      hairFront: `<path d="M53 76 Q54 26 100 24 Q146 26 147 76 Q138 58 120 56 Q112 44 100 54 Q88 44 78 58 Q62 58 53 76Z" fill="url(#gal${u})" ${SW}/>` + sparkle(80, 38, 4, '#fff', 0.3) + sparkle(124, 42, 3.5, '#fff', 1),
    }),
  });
  def({
    id: 'hair-flame', slot: 'hair', name: '不滅之焰', rarity: 'legendary',
    layers: (u) => ({
      defs: `<linearGradient id="fl${u}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff3d00"/><stop offset=".6" stop-color="#ff9100"/><stop offset="1" stop-color="#ffea00"/></linearGradient>`,
      hairBack: `<g class="anim-flicker"><path d="M50 86 Q36 50 58 40 Q52 14 78 18 Q84 -6 104 8 Q120 -8 130 16 Q154 12 148 40 Q170 54 152 86 Q150 110 140 118 L60 118 Q50 110 50 86Z" fill="url(#fl${u})" ${SW}/></g>`,
      hairFront: `<path d="M53 74 L58 46 L72 56 L76 32 L92 50 L100 26 L110 50 L126 32 L128 56 L142 46 L147 74 Q130 60 100 58 Q70 60 53 74Z" fill="url(#fl${u})" ${SW}/>`,
    }),
  });

  /* ================= HATS ================= */
  const beanie = (id, name, c) => def({ id, slot: 'hat', name, rarity: 'common', layers: { hat: `<path d="M56 50 Q56 8 100 6 Q144 8 144 50Z" fill="${c}" ${SW}/><rect x="50" y="40" width="100" height="16" rx="8" fill="${shade(c, -30)}" ${SW}/><circle cx="100" cy="4" r="9" fill="#fff" ${SW}/>` } });
  beanie('hat-beanie-blue', '毛線帽・藍', '#4f8cff');
  beanie('hat-beanie-red', '毛線帽・紅', '#ef4b5f');
  def({ id: 'hat-headband', slot: 'hat', name: '運動頭帶', rarity: 'common', layers: { hat: `<path d="M54 54 Q100 30 146 54" stroke="#ff5a5a" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M146 54 L160 46 M146 54 L160 64" stroke="#ff5a5a" stroke-width="5" stroke-linecap="round"/>` } });
  def({ id: 'hat-straw', slot: 'hat', name: '冒險草帽', rarity: 'common', layers: { hat: `<ellipse cx="100" cy="42" rx="66" ry="13" fill="#f2cf73" ${SW}/><path d="M66 42 Q66 4 100 4 Q134 4 134 42Z" fill="#f2cf73" ${SW}/><path d="M67 32 Q100 26 133 32 L134 40 Q100 34 66 40Z" fill="#e5484d"/>` } });
  def({ id: 'hat-cat', slot: 'hat', name: '貓耳髮箍', rarity: 'rare', layers: { hat: `<path d="M58 46 L60 4 L90 28Z" fill="#3a3340" ${SW}/><path d="M64 36 L65 16 L80 28Z" fill="#ff9fc0"/><path d="M142 46 L140 4 L110 28Z" fill="#3a3340" ${SW}/><path d="M136 36 L135 16 L120 28Z" fill="#ff9fc0"/>` } });
  def({ id: 'hat-wizard', slot: 'hat', name: '見習法師帽', rarity: 'rare', layers: { hat: `<ellipse cx="100" cy="44" rx="62" ry="12" fill="#6d3fd1" ${SW}/><path d="M64 44 Q86 10 112 -30 Q118 -8 136 44Z" fill="#6d3fd1" ${SW}/><path d="M66 38 Q100 30 134 38 L135 44 Q100 38 65 44Z" fill="#ffd23f"/><path d="M104 10 l3 6 6 1 -4.5 4 1 6 -5.5 -3 -5.5 3 1 -6 -4.5 -4 6 -1z" fill="#ffd23f"/>` } });
  def({ id: 'hat-pirate', slot: 'hat', name: '海盜船長帽', rarity: 'rare', layers: { hat: `<path d="M42 48 Q100 -8 158 48 Q100 30 42 48Z" fill="#25212b" ${SW}/><path d="M50 44 Q100 30 150 44" stroke="#ffd23f" stroke-width="3" fill="none"/><circle cx="100" cy="24" r="7" fill="#fff"/><path d="M95 32 L105 32" stroke="#fff" stroke-width="3"/>` } });
  def({ id: 'hat-flower', slot: 'hat', name: '春日花冠', rarity: 'epic', layers: { hat: [[58, 46, '#ff8fb8'], [72, 34, '#fff36b'], [88, 28, '#8fd3ff'], [104, 26, '#ff8fb8'], [120, 30, '#c4a1ff'], [134, 38, '#fff36b'], [144, 50, '#8fd3ff']].map(([x, y, c]) => `<g><circle cx="${x - 5}" cy="${y}" r="5" fill="${c}"/><circle cx="${x + 5}" cy="${y}" r="5" fill="${c}"/><circle cx="${x}" cy="${y - 5}" r="5" fill="${c}"/><circle cx="${x}" cy="${y + 5}" r="5" fill="${c}"/><circle cx="${x}" cy="${y}" r="3.5" fill="#ffb02e"/></g>`).join('') } });
  def({ id: 'hat-crown', slot: 'hat', name: '黃金王冠', rarity: 'epic', layers: { hat: `<path d="M62 44 L64 6 L82 24 L100 0 L118 24 L136 6 L138 44Z" fill="#ffc83d" ${SW}/><rect x="60" y="36" width="80" height="12" rx="3" fill="#f0a500" ${SW}/><circle cx="100" cy="42" r="4.5" fill="#e5484d"/><circle cx="80" cy="42" r="3.5" fill="#3b82f6"/><circle cx="120" cy="42" r="3.5" fill="#22c55e"/>` + sparkle(66, 8, 4, '#fff', 0.2) } });
  def({ id: 'hat-bunny', slot: 'hat', name: '兔兔長耳', rarity: 'epic', layers: { hat: `<path d="M76 40 Q58 -20 72 -28 Q90 -24 90 36Z" fill="#fff" ${SW}/><path d="M77 24 Q68 -10 74 -18 Q82 -14 84 26Z" fill="#ffc2d6"/><path d="M124 40 Q142 -20 128 -28 Q110 -24 110 36Z" fill="#fff" ${SW}/><path d="M123 24 Q132 -10 126 -18 Q118 -14 116 26Z" fill="#ffc2d6"/>` } });
  def({ id: 'hat-halo', slot: 'hat', name: '天使光環', rarity: 'legendary', layers: { hat: `<g class="anim-float"><ellipse cx="100" cy="2" rx="36" ry="9" fill="none" stroke="#fff3a0" stroke-width="10" opacity=".45"/><ellipse cx="100" cy="2" rx="36" ry="9" fill="none" stroke="#ffd23f" stroke-width="5"/></g>` + sparkle(62, -6, 5, '#fff7c2', 0) + sparkle(142, 8, 4, '#fff7c2', 0.8) } });
  def({
    id: 'hat-horns', slot: 'hat', name: '遠古龍角', rarity: 'legendary',
    layers: (u) => ({
      defs: `<linearGradient id="hn${u}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#4c1d95"/><stop offset="1" stop-color="#f472b6"/></linearGradient>`,
      hat: `<g class="anim-glow"><path d="M66 44 Q40 20 52 -16 Q60 14 84 32Z" fill="url(#hn${u})" ${SW}/><path d="M134 44 Q160 20 148 -16 Q140 14 116 32Z" fill="url(#hn${u})" ${SW}/></g>` + sparkle(52, -18, 5, '#ffb3f0', 0.3) + sparkle(148, -18, 5, '#ffb3f0', 1),
    }),
  });

  /* ================= FACE ================= */
  def({ id: 'face-round', slot: 'face', name: '圓框眼鏡', rarity: 'common', layers: { faceAcc: `<circle cx="81" cy="82" r="12" fill="rgba(255,255,255,.25)" stroke="#5b4636" stroke-width="3"/><circle cx="119" cy="82" r="12" fill="rgba(255,255,255,.25)" stroke="#5b4636" stroke-width="3"/><path d="M93 81 Q100 77 107 81" stroke="#5b4636" stroke-width="3" fill="none"/>` } });
  def({ id: 'face-bandage', slot: 'face', name: '勇者 OK 繃', rarity: 'common', layers: { faceAcc: `<g transform="rotate(-20 126 100)"><rect x="114" y="95" width="24" height="10" rx="4" fill="#ffd8a8" stroke="#c9905a" stroke-width="1.5"/><rect x="122" y="95" width="8" height="10" fill="#f5c38f"/></g>` } });
  def({ id: 'face-sunglasses', slot: 'face', name: '酷炫墨鏡', rarity: 'rare', layers: { faceAcc: `<path d="M64 76 L96 76 Q96 94 81 94 Q66 94 64 76Z" fill="#1d1b24" ${SW}/><path d="M104 76 L136 76 Q134 94 119 94 Q104 94 104 76Z" fill="#1d1b24" ${SW}/><path d="M96 78 L104 78" stroke="#1d1b24" stroke-width="3"/><path d="M70 80 L78 80" stroke="#fff" stroke-width="2" opacity=".6"/>` } });
  def({ id: 'face-star', slot: 'face', name: '閃亮星星貼紙', rarity: 'rare', layers: { faceAcc: `<path d="M128 90 l3.5 7 7.5 1 -5.5 5.2 1.4 7.6 -6.9 -3.7 -6.9 3.7 1.4 -7.6 -5.5 -5.2 7.5 -1z" fill="#ffd23f" stroke="#e0a400" stroke-width="1.2"/>` } });
  def({ id: 'face-fox', slot: 'face', name: '稻荷狐面', rarity: 'epic', layers: { faceAcc: `<g transform="rotate(18 136 56)"><path d="M116 70 L118 34 L130 48 L142 48 L154 34 L156 70 Q136 92 116 70Z" fill="#fff" ${SW}/><path d="M124 58 Q130 54 134 60 M138 60 Q142 54 148 58" stroke="#e5484d" stroke-width="3" fill="none"/><path d="M121 40 L127 48 M151 40 L145 48" stroke="#e5484d" stroke-width="3"/></g>` } });
  def({ id: 'face-visor', slot: 'face', name: '賽博護目鏡', rarity: 'legendary', layers: { faceAcc: `<path d="M58 72 Q100 64 142 72 L140 92 Q100 100 60 92Z" fill="rgba(34,211,238,.35)" stroke="#0e7490" stroke-width="3"/><rect class="anim-scan" x="62" y="74" width="76" height="3" fill="#a5f3fc"/><path d="M58 72 L50 80 M142 72 L150 80" stroke="#0e7490" stroke-width="3"/>` + sparkle(140, 70, 4, '#a5f3fc', 0.5) } });

  /* ================= TOPS ================= */
  const torso = (fill) => `<path d="M70 122 Q100 112 130 122 L134 184 Q100 192 66 184Z" fill="${fill}" ${SW}/>`;
  const tee = (id, name, rarity, c, starter) => def({ id, slot: 'top', name, rarity, starter, sleeve: c, layers: { top: torso(c) + `<path d="M88 118 Q100 128 112 118" stroke="${shade(c, -40)}" stroke-width="2" fill="none"/>` } });
  tee('top-tee-white', '素面 T 恤', 'common', '#f8fafc', true);
  tee('top-tee-green', '森林 T 恤', 'common', '#4ade80');
  def({
    id: 'top-stripes', slot: 'top', name: '水手條紋衫', rarity: 'common', sleeve: '#f8fafc',
    layers: (u) => ({
      defs: `<clipPath id="st${u}"><path d="M70 122 Q100 112 130 122 L134 184 Q100 192 66 184Z"/></clipPath>`,
      top: torso('#f8fafc') + `<g clip-path="url(#st${u})">${[134, 150, 166, 182].map((y) => `<rect x="60" y="${y}" width="80" height="7" fill="#1e3a8a"/>`).join('')}</g>` + `<path d="M70 122 Q100 112 130 122 L134 184 Q100 192 66 184Z" fill="none" ${SW}/>`,
    }),
  });
  def({ id: 'top-hoodie', slot: 'top', name: '宅宅帽 T', rarity: 'common', sleeve: '#9ca3af', layers: { top: `<path d="M74 124 Q100 140 126 124 Q118 108 100 108 Q82 108 74 124Z" fill="#7b8291" ${SW}/>` + torso('#9ca3af') + `<path d="M84 160 L116 160 L120 176 L80 176Z" fill="#8a919e" ${SW}/><path d="M94 124 L92 144 M106 124 L108 144" stroke="#fff" stroke-width="2.5"/>` } });
  def({
    id: 'top-plaid', slot: 'top', name: '工程師格子衫', rarity: 'rare', sleeve: '#d64545',
    layers: (u) => ({
      defs: `<clipPath id="pl${u}"><path d="M70 122 Q100 112 130 122 L134 184 Q100 192 66 184Z"/></clipPath>`,
      top: torso('#d64545') + `<g clip-path="url(#pl${u})" opacity=".55">${[72, 88, 104, 120].map((x) => `<rect x="${x}" y="110" width="6" height="90" fill="#3b1f1f"/>`).join('')}${[128, 146, 164, 182].map((y) => `<rect x="60" y="${y}" width="80" height="6" fill="#3b1f1f"/>`).join('')}</g><path d="M70 122 Q100 112 130 122 L134 184 Q100 192 66 184Z" fill="none" ${SW}/><path d="M100 118 L100 186" stroke="#7f1d1d" stroke-width="2"/><circle cx="104" cy="136" r="2" fill="#fff"/><circle cx="104" cy="154" r="2" fill="#fff"/><circle cx="104" cy="172" r="2" fill="#fff"/>`,
    }),
  });
  def({ id: 'top-uniform', slot: 'top', name: '學院制服', rarity: 'rare', sleeve: '#1e2a5a', layers: { top: torso('#1e2a5a') + `<path d="M84 118 L100 140 L116 118 L110 116 L100 126 L90 116Z" fill="#fff" ${SW}/><path d="M97 128 L103 128 L106 158 L100 166 L94 158Z" fill="#e5484d" ${SW}/><path d="M76 134 L86 134" stroke="#ffd23f" stroke-width="3"/>` } });
  def({ id: 'top-armor', slot: 'top', name: '騎士鎧甲', rarity: 'epic', sleeve: '#a7b4c8', layers: { top: torso('#c3cede') + `<path d="M76 128 Q100 120 124 128 L122 160 Q100 170 78 160Z" fill="#dfe6f0" ${SW}/><path d="M100 126 L100 166" stroke="#8c99ad" stroke-width="2.5"/><circle cx="100" cy="142" r="7" fill="#3b82f6" ${SW}/><path d="M66 128 Q60 118 74 116 L80 130Z" fill="#a7b4c8" ${SW}/><path d="M134 128 Q140 118 126 116 L120 130Z" fill="#a7b4c8" ${SW}/>` } });
  def({ id: 'top-robe', slot: 'top', name: '星辰法袍', rarity: 'epic', sleeve: '#5b2fb5', layers: { top: `<path d="M70 122 Q100 112 130 122 L140 196 Q100 206 60 196Z" fill="#5b2fb5" ${SW}/><path d="M100 120 L100 200" stroke="#ffd23f" stroke-width="3"/><path d="M78 160 l2.5 5 5.5 .8 -4 3.8 1 5.4 -5 -2.6 -5 2.6 1 -5.4 -4 -3.8 5.5 -.8z" fill="#ffd23f"/><path d="M120 140 l2 4 4.4 .6 -3.2 3 .8 4.4 -4 -2.1 -4 2.1 .8 -4.4 -3.2 -3 4.4 -.6z" fill="#ffd23f"/>` } });
  def({
    id: 'top-dragon', slot: 'top', name: '龍鱗戰甲', rarity: 'legendary', sleeve: '#b91c1c',
    layers: (u) => ({
      defs: `<linearGradient id="dg${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd23f"/><stop offset="1" stop-color="#d97706"/></linearGradient><radialGradient id="dc${u}"><stop offset="0" stop-color="#fff"/><stop offset=".4" stop-color="#22d3ee"/><stop offset="1" stop-color="#0e7490"/></radialGradient>`,
      top: torso('#b91c1c') + `<path d="M74 126 Q100 116 126 126 L124 168 Q100 180 76 168Z" fill="url(#dg${u})" ${SW}/>${[[86, 136], [114, 136], [86, 156], [114, 156]].map(([x, y]) => `<path d="M${x - 8} ${y} Q${x} ${y + 10} ${x + 8} ${y}" stroke="#92400e" stroke-width="2" fill="none"/>`).join('')}<circle class="anim-glow" cx="100" cy="146" r="9" fill="url(#dc${u})" ${SW}/>` + sparkle(128, 124, 4, '#fff', 0.6),
    }),
  });

  /* ================= BOTTOMS ================= */
  const pants = (c, long) => `<path d="M68 176 L132 176 L133 ${long ? 224 : 200} L104 ${long ? 224 : 200} L100 196 L96 ${long ? 224 : 200} L67 ${long ? 224 : 200}Z" fill="${c}" ${SW}/>`;
  def({ id: 'bottom-jeans', slot: 'bottom', name: '經典牛仔褲', rarity: 'common', starter: true, layers: { bottom: pants('#3b6db3', true) + `<path d="M100 178 L100 194" stroke="${shade('#3b6db3', -40)}" stroke-width="2"/>` } });
  def({ id: 'bottom-shorts', slot: 'bottom', name: '探險短褲', rarity: 'common', layers: { bottom: pants('#c8a46a', false) } });
  def({ id: 'bottom-skirt', slot: 'bottom', name: '百褶短裙', rarity: 'rare', layers: { bottom: `<path d="M68 176 L132 176 L142 206 L58 206Z" fill="#f472b6" ${SW}/>` + [72, 84, 96, 108, 120].map((x) => `<path d="M${x + 4} 180 L${x - 1 + (x - 100) * 0.25} 205" stroke="#be185d" stroke-width="1.5" opacity=".7"/>`).join('') } });
  def({ id: 'bottom-cargo', slot: 'bottom', name: '軍綠工作褲', rarity: 'rare', layers: { bottom: pants('#6b7a3a', true) + `<rect x="70" y="196" width="14" height="12" rx="2" fill="#5a6830" ${SW}/><rect x="116" y="196" width="14" height="12" rx="2" fill="#5a6830" ${SW}/>` } });
  def({ id: 'bottom-armor', slot: 'bottom', name: '騎士護腿', rarity: 'epic', layers: { bottom: pants('#c3cede', true) + `<path d="M70 200 L96 200 M104 200 L130 200" stroke="#8c99ad" stroke-width="3"/><circle cx="83" cy="206" r="4" fill="#3b82f6"/><circle cx="117" cy="206" r="4" fill="#3b82f6"/>` } });
  def({
    id: 'bottom-starskirt', slot: 'bottom', name: '星光舞裙', rarity: 'legendary',
    layers: (u) => ({
      defs: `<linearGradient id="ss${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#312e81"/><stop offset="1" stop-color="#7c3aed"/></linearGradient>`,
      bottom: `<path d="M68 176 L132 176 L148 212 Q100 222 52 212Z" fill="url(#ss${u})" ${SW}/>` + sparkle(76, 200, 4, '#fff', 0) + sparkle(104, 192, 3, '#fde68a', 0.5) + sparkle(130, 204, 4, '#fff', 1.1) + sparkle(92, 210, 2.5, '#fff', 0.8),
    }),
  });

  /* ================= SHOES ================= */
  const shoe = (c, extra) => `<path d="M76 222 L98 222 L100 234 Q88 238 74 234Z" fill="${c}" ${SW}/><path d="M102 222 L124 222 L126 234 Q112 238 100 234Z" fill="${c}" ${SW}/>` + (extra || '');
  def({ id: 'shoes-cloth', slot: 'shoes', name: '樸素布鞋', rarity: 'common', starter: true, layers: { shoes: shoe('#7a4a2a') } });
  def({ id: 'shoes-sneakers', slot: 'shoes', name: '紅色球鞋', rarity: 'common', layers: { shoes: shoe('#ef4444', `<path d="M76 232 L99 232 M101 232 L125 232" stroke="#fff" stroke-width="3"/>`) } });
  def({ id: 'shoes-boots', slot: 'shoes', name: '旅人長靴', rarity: 'rare', layers: { shoes: `<path d="M80 206 L98 206 L99 234 Q88 238 74 234 L78 222Z" fill="#8b5a2b" ${SW}/><path d="M102 206 L120 206 L122 222 L126 234 Q112 238 101 234Z" fill="#8b5a2b" ${SW}/><path d="M80 212 L98 212 M102 212 L120 212" stroke="#c48a4f" stroke-width="3"/>` } });
  def({ id: 'shoes-crystal', slot: 'shoes', name: '水晶鞋', rarity: 'epic', layers: { shoes: shoe('rgba(165,243,252,.85)', sparkle(88, 228, 3, '#fff', 0.2) + sparkle(114, 228, 3, '#fff', 0.9)) } });
  def({ id: 'shoes-rocket', slot: 'shoes', name: '火箭推進鞋', rarity: 'epic', layers: { shoes: `<g class="anim-flicker"><path d="M80 236 Q86 254 92 236Z" fill="#ff9100"/><path d="M108 236 Q114 254 120 236Z" fill="#ff9100"/></g>` + shoe('#64748b', `<rect x="80" y="224" width="12" height="4" fill="#f59e0b"/><rect x="108" y="224" width="12" height="4" fill="#f59e0b"/>`) } });
  def({ id: 'shoes-winged', slot: 'shoes', name: '赫密士之翼', rarity: 'legendary', layers: { shoes: shoe('#fde68a', `<g class="anim-flap" style="transform-origin:76px 226px"><path d="M76 226 Q58 212 54 222 Q62 222 58 228 Q66 226 64 232Z" fill="#fff" ${SW}/></g><g class="anim-flap" style="transform-origin:124px 226px"><path d="M124 226 Q142 212 146 222 Q138 222 142 228 Q134 226 136 232Z" fill="#fff" ${SW}/></g>`) } });

  /* ================= HAND ================= */
  const inHand = (svg) => `<g transform="translate(138 172)">${svg}</g>`;
  def({ id: 'hand-woodsword', slot: 'hand', name: '新手木劍', rarity: 'common', layers: { hand: inHand(`<g transform="rotate(-18)"><rect x="-4" y="-62" width="9" height="56" rx="3" fill="#c8915a" ${SW}/><rect x="-12" y="-8" width="25" height="7" rx="3" fill="#8b5a2b" ${SW}/><rect x="-3" y="-1" width="7" height="12" rx="2" fill="#6b3f1d" ${SW}/></g>`) } });
  def({ id: 'hand-coffee', slot: 'hand', name: '續命咖啡', rarity: 'common', layers: { hand: inHand(`<path d="M-8 -22 L10 -22 L8 2 L-6 2Z" fill="#fff" ${SW}/><rect x="-9" y="-12" width="20" height="8" fill="#8b5a2b"/><path d="M-2 -28 Q2 -34 -1 -40 M5 -28 Q9 -34 6 -40" stroke="#cbd5e1" stroke-width="2" fill="none" class="anim-float"/>`) } });
  def({ id: 'hand-keyboard', slot: 'hand', name: '機械鍵盤', rarity: 'rare', layers: { hand: inHand(`<g transform="rotate(-70)"><rect x="-30" y="-12" width="60" height="22" rx="4" fill="#2d2a35" ${SW}/>${[-24, -14, -4, 6, 16].map((x) => `<rect x="${x}" y="-8" width="7" height="6" rx="1" fill="${x === 6 ? '#ff5a5a' : '#cbd5e1'}"/><rect x="${x}" y="0" width="7" height="6" rx="1" fill="#cbd5e1"/>`).join('')}</g>`) } });
  def({ id: 'hand-book', slot: 'hand', name: '演算法魔導書', rarity: 'rare', layers: { hand: inHand(`<rect x="-6" y="-30" width="26" height="32" rx="3" fill="#2563eb" ${SW}/><rect x="-2" y="-27" width="3" height="27" fill="#1e3a8a"/><text x="9" y="-9" font-size="12" font-weight="bold" fill="#ffd23f" text-anchor="middle" font-family="monospace">{}</text>`) } });
  def({ id: 'hand-duck', slot: 'hand', name: '除錯小黃鴨', rarity: 'epic', layers: { hand: inHand(`<g class="anim-bob"><ellipse cx="4" cy="-8" rx="15" ry="11" fill="#ffd23f" ${SW}/><circle cx="12" cy="-22" r="9" fill="#ffd23f" ${SW}/><path d="M19 -22 L27 -19 L19 -16Z" fill="#ff9100" ${SW}/><circle cx="14" cy="-24" r="1.8" fill="${O}"/></g>`) } });
  def({ id: 'hand-staff', slot: 'hand', name: '奧術法杖', rarity: 'epic', layers: { hand: inHand(`<rect x="-3" y="-80" width="7" height="100" rx="3" fill="#7c4a1e" ${SW}/><circle class="anim-glow" cx="0" cy="-86" r="11" fill="#a855f7" ${SW}/><circle cx="-3" cy="-89" r="3.5" fill="#f5d0fe"/>`) } });
  def({
    id: 'hand-lambda', slot: 'hand', name: 'λ 聖劍', rarity: 'legendary',
    layers: (u) => ({
      defs: `<linearGradient id="lb${u}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e0f2fe"/><stop offset="1" stop-color="#38bdf8"/></linearGradient>`,
      hand: inHand(`<g transform="rotate(-14)"><path class="anim-glow" d="M-6 -6 L-6 -84 L0 -98 L6 -84 L6 -6Z" fill="url(#lb${u})" ${SW}/><text x="0" y="-40" font-size="16" font-weight="bold" fill="#0369a1" text-anchor="middle" font-family="serif">λ</text><rect x="-16" y="-8" width="32" height="8" rx="4" fill="#ffc83d" ${SW}/><rect x="-4" y="0" width="8" height="14" rx="2" fill="#7c3aed" ${SW}/></g>` + sparkle(10, -96, 5, '#fff', 0.2) + sparkle(-14, -70, 4, '#bae6fd', 0.9)),
    }),
  });

  /* ================= BACK ================= */
  def({ id: 'back-backpack', slot: 'back', name: '冒險背包', rarity: 'common', layers: { back: `<rect x="62" y="122" width="76" height="62" rx="16" fill="#e98b3a" ${SW}/><rect x="72" y="150" width="56" height="28" rx="8" fill="#d97526" ${SW}/>` } });
  def({ id: 'back-cape', slot: 'back', name: '英雄紅披風', rarity: 'rare', layers: { back: `<path class="anim-sway" d="M72 120 Q100 112 128 120 L150 214 Q100 226 50 214Z" fill="#dc2626" ${SW}/>` } });
  def({ id: 'back-angel', slot: 'back', name: '天使之翼', rarity: 'epic', layers: { back: `<g class="anim-flap" style="transform-origin:76px 140px"><path d="M76 140 Q30 96 12 120 Q22 128 14 140 Q28 142 22 156 Q40 156 38 170 Q60 162 78 156Z" fill="#fff" ${SW}/></g><g class="anim-flap" style="transform-origin:124px 140px"><path d="M124 140 Q170 96 188 120 Q178 128 186 140 Q172 142 178 156 Q160 156 162 170 Q140 162 122 156Z" fill="#fff" ${SW}/></g>` } });
  def({ id: 'back-bat', slot: 'back', name: '小惡魔之翼', rarity: 'epic', layers: { back: `<g class="anim-flap" style="transform-origin:76px 140px"><path d="M76 140 Q40 100 14 116 Q26 128 20 140 Q34 136 34 150 Q48 144 52 158 Q64 148 78 154Z" fill="#4c1d95" ${SW}/></g><g class="anim-flap" style="transform-origin:124px 140px"><path d="M124 140 Q160 100 186 116 Q174 128 180 140 Q166 136 166 150 Q152 144 148 158 Q136 148 122 154Z" fill="#4c1d95" ${SW}/></g>` } });
  def({
    id: 'back-phoenix', slot: 'back', name: '鳳凰之翼', rarity: 'legendary',
    layers: (u) => ({
      defs: `<linearGradient id="ph${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffea00"/><stop offset=".5" stop-color="#ff6d00"/><stop offset="1" stop-color="#d50000"/></linearGradient>`,
      back: `<g class="anim-flap" style="transform-origin:76px 140px"><path d="M76 140 Q36 70 0 92 Q18 104 4 116 Q24 122 10 138 Q30 142 22 160 Q44 156 42 176 Q62 164 78 156Z" fill="url(#ph${u})" ${SW}/></g><g class="anim-flap" style="transform-origin:124px 140px"><path d="M124 140 Q164 70 200 92 Q182 104 196 116 Q176 122 190 138 Q170 142 178 160 Q156 156 158 176 Q138 164 122 156Z" fill="url(#ph${u})" ${SW}/></g>` + sparkle(14, 96, 5, '#fff7c2', 0) + sparkle(190, 100, 5, '#fff7c2', 0.6) + sparkle(30, 160, 4, '#fff7c2', 1.2),
    }),
  });

  /* ================= PETS ================= */
  const pet = (svg) => `<g class="anim-bob" style="animation-delay:.4s"><g transform="translate(178 226)">${svg}</g></g>`;
  def({ id: 'pet-chick', slot: 'pet', name: '小雞嗶嗶', rarity: 'rare', layers: { pet: pet(`<ellipse cx="0" cy="0" rx="15" ry="14" fill="#ffe14d" ${SW}/><circle cx="-5" cy="-3" r="2" fill="${O}"/><circle cx="5" cy="-3" r="2" fill="${O}"/><path d="M-3 2 L0 6 L3 2Z" fill="#ff9100"/><path d="M-2 -14 Q0 -20 3 -14" stroke="${O}" stroke-width="2" fill="none"/>`) } });
  def({ id: 'pet-ghost', slot: 'pet', name: '小幽靈 Boo', rarity: 'rare', layers: { pet: pet(`<path d="M-14 8 Q-16 -18 0 -18 Q16 -18 14 8 L9 4 L4 9 L0 4 L-4 9 L-9 4Z" fill="#f1f5f9" ${SW}/><circle cx="-5" cy="-6" r="2.2" fill="${O}"/><circle cx="5" cy="-6" r="2.2" fill="${O}"/><ellipse cx="0" cy="1" rx="2.5" ry="3" fill="${O}"/>`) } });
  def({ id: 'pet-slime', slot: 'pet', name: '史萊姆寶寶', rarity: 'epic', layers: { pet: pet(`<path d="M-18 10 Q-20 -16 0 -18 Q20 -16 18 10Z" fill="#4ade80" ${SW}/><ellipse cx="-6" cy="-10" rx="4" ry="3" fill="#bbf7d0"/><circle cx="-6" cy="-1" r="2.4" fill="${O}"/><circle cx="6" cy="-1" r="2.4" fill="${O}"/><path d="M-3 4 Q0 7 3 4" stroke="${O}" stroke-width="1.8" fill="none"/>`) } });
  def({ id: 'pet-cat', slot: 'pet', name: '橘貓 Bug 喵', rarity: 'epic', layers: { pet: pet(`<path d="M14 6 Q30 0 26 -14" stroke="#f59e0b" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="0" cy="2" rx="16" ry="12" fill="#f59e0b" ${SW}/><path d="M-13 -6 L-12 -20 L-3 -10Z M13 -6 L12 -20 L3 -10Z" fill="#f59e0b" ${SW}/><circle cx="-5" cy="-1" r="2" fill="${O}"/><circle cx="5" cy="-1" r="2" fill="${O}"/><path d="M-2 4 Q0 6 2 4" stroke="${O}" stroke-width="1.6" fill="none"/>`) } });
  def({ id: 'pet-dragon', slot: 'pet', name: '小龍 Dijkstra', rarity: 'legendary', layers: { pet: pet(`<g class="anim-flap" style="transform-origin:-6px -6px"><path d="M-6 -6 Q-22 -26 -28 -10 Q-18 -10 -14 -2Z" fill="#a78bfa" ${SW}/></g><ellipse cx="0" cy="2" rx="15" ry="13" fill="#34d399" ${SW}/><path d="M-8 -8 L-6 -18 L-2 -10 M8 -8 L6 -18 L2 -10" fill="#fde68a"/><circle cx="-5" cy="-1" r="2.4" fill="${O}"/><circle cx="5" cy="-1" r="2.4" fill="${O}"/><ellipse cx="0" cy="7" rx="7" ry="4" fill="#bbf7d0"/>` + sparkle(18, -18, 4, '#fff7c2', 0.5)) } });

  const BY_ID = Object.fromEntries(ITEMS.map((i) => [i.id, i]));
  const STARTERS = ITEMS.filter((i) => i.starter).map((i) => i.id);
  const DEFAULT_EQUIP = { hair: 'hair-brown', top: 'top-tee-white', bottom: 'bottom-jeans', shoes: 'shoes-cloth' };

  const LAYER_ORDER = ['back', 'hairBack', 'base-legs', 'bottom', 'shoes', 'top', 'base-arms', 'hand', 'base-head', 'hairFront', 'faceAcc', 'hat', 'pet'];

  function itemLayers(item, u) {
    return typeof item.layers === 'function' ? item.layers(u) : item.layers;
  }

  /**
   * equip: { slot: itemId }, look: { skin, eyes }, opts: { size, mood: 'happy'|'hurt'|'win', idle }
   */
  function render(equip, look, opts) {
    opts = opts || {};
    look = look || {};
    const u = 'a' + (++uid);
    const skin = SKINS[look.skin || 0] || SKINS[0];
    const eye = EYES[look.eyes || 0] || EYES[0];
    const layers = {};
    let defs = '';
    let sleeve = '#f8fafc';
    const eq = Object.assign({}, DEFAULT_EQUIP, equip || {});
    for (const slot of Object.keys(eq)) {
      const it = BY_ID[eq[slot]];
      if (!it) continue;
      const L = itemLayers(it, u);
      for (const k in L) {
        if (k === 'defs') defs += L[k];
        else layers[k] = (layers[k] || '') + L[k];
      }
      if (it.sleeve) sleeve = it.sleeve;
    }
    const mood = opts.mood || 'happy';
    let eyes;
    if (mood === 'win') eyes = `<path d="M74 84 Q81 74 88 84" stroke="${O}" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M112 84 Q119 74 126 84" stroke="${O}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
    else if (mood === 'hurt') eyes = `<path d="M75 76 L87 86 M87 76 L75 86" stroke="${O}" stroke-width="3" stroke-linecap="round"/><path d="M113 76 L125 86 M125 76 L113 86" stroke="${O}" stroke-width="3" stroke-linecap="round"/>`;
    else eyes = `<g class="anim-blink"><ellipse cx="81" cy="83" rx="4" ry="5.2" fill="${eye}"/><ellipse cx="119" cy="83" rx="4" ry="5.2" fill="${eye}"/></g>`;
    const mouth = mood === 'hurt' ? `<path d="M93 101 Q100 95 107 101" stroke="${O}" stroke-width="2.4" fill="none" stroke-linecap="round"/>` :
      mood === 'win' ? `<path d="M91 96 Q100 108 109 96Z" fill="#c2410c"/>` :
        `<path d="M93 97 Q100 103 107 97" stroke="${O}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    const base = {
      'base-legs': `<rect x="84" y="176" width="13" height="52" rx="6" fill="${skin}" ${SW}/><rect x="103" y="176" width="13" height="52" rx="6" fill="${skin}" ${SW}/>`,
      'base-arms': `<path d="M76 130 Q62 146 62 166" stroke="${sleeve}" stroke-width="11" fill="none" stroke-linecap="round"/><path d="M124 130 Q138 146 138 166" stroke="${sleeve}" stroke-width="11" fill="none" stroke-linecap="round"/><circle cx="62" cy="171" r="8" fill="${skin}" ${SW}/><circle cx="138" cy="171" r="8" fill="${skin}" ${SW}/>`,
      'base-head': `<rect x="93" y="108" width="14" height="14" fill="${skin}"/><ellipse cx="53" cy="84" rx="7" ry="10" fill="${skin}" ${SW}/><ellipse cx="147" cy="84" rx="7" ry="10" fill="${skin}" ${SW}/><ellipse cx="100" cy="74" rx="47" ry="44" fill="${skin}" ${SW}/>${eyes}<ellipse cx="69" cy="96" rx="7.5" ry="4.5" fill="#ff8fa3" opacity=".55"/><ellipse cx="131" cy="96" rx="7.5" ry="4.5" fill="#ff8fa3" opacity=".55"/>${mouth}`,
    };
    let body = '';
    for (const L of LAYER_ORDER) body += base[L] || layers[L] || '';
    const shadow = `<ellipse cx="100" cy="240" rx="46" ry="7" fill="rgba(0,0,0,.18)"/>`;
    const cls = 'avatar' + (opts.idle === false ? '' : ' avatar-idle') + (opts.cls ? ' ' + opts.cls : '');
    return `<svg class="${cls}" viewBox="-12 -36 224 290" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="角色">${defs ? '<defs>' + defs + '</defs>' : ''}${shadow}<g class="avatar-body">${body}</g></svg>`;
  }

  /** Small preview of a single item (on a mannequin-free canvas). */
  function renderItem(item) {
    const u = 'i' + (++uid);
    const L = itemLayers(item, u);
    let defs = L.defs || '';
    let body = '';
    for (const k of LAYER_ORDER) if (L[k]) body += L[k];
    if (item.slot === 'top') {
      // show sleeves too
      body = `<path d="M76 130 Q62 146 62 166" stroke="${item.sleeve}" stroke-width="11" fill="none" stroke-linecap="round"/><path d="M124 130 Q138 146 138 166" stroke="${item.sleeve}" stroke-width="11" fill="none" stroke-linecap="round"/>` + body;
    }
    const vb = { hat: '30 -40 140 110', hair: '10 -10 180 210', face: '45 25 120 100', top: '40 100 120 110', bottom: '45 165 110 75', shoes: '45 195 110 60', hand: '90 50 110 150', back: '-5 60 210 170', pet: '140 180 70 70' }[item.slot];
    return `<svg class="item-svg" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${defs ? '<defs>' + defs + '</defs>' : ''}${body}</svg>`;
  }

  /* ---------------- chests ---------------- */
  const CHESTS = {
    wood: { id: 'wood', name: '木寶箱', price: 150, items: 1, coins: [10, 30], odds: { common: 80, rare: 18, epic: 2, legendary: 0 }, color: '#a16207', light: '#d6a35c' },
    bronze: { id: 'bronze', name: '銅寶箱', price: 400, items: 2, coins: [30, 80], odds: { common: 52, rare: 36, epic: 10, legendary: 2 }, color: '#b45309', light: '#f59e0b' },
    gold: { id: 'gold', name: '黃金寶箱', price: 1000, items: 2, coins: [80, 200], odds: { common: 15, rare: 45, epic: 32, legendary: 8 }, color: '#ca8a04', light: '#fde047' },
    diamond: { id: 'diamond', name: '鑽石寶箱', price: 2500, items: 3, coins: [200, 400], odds: { common: 0, rare: 20, epic: 50, legendary: 30 }, color: '#0891b2', light: '#67e8f9' },
  };
  const CHEST_ORDER = ['wood', 'bronze', 'gold', 'diamond'];

  function renderChest(type, opts) {
    opts = opts || {};
    const c = CHESTS[type] || CHESTS.wood;
    const u = 'c' + (++uid);
    const open = !!opts.open;
    const gem = type === 'diamond' ? `<path d="M100 74 L110 84 L100 98 L90 84Z" fill="#a5f3fc" stroke="#0e7490" stroke-width="2.5"/>` : type === 'gold' ? `<circle cx="100" cy="86" r="9" fill="#fef08a" stroke="#854d0e" stroke-width="2.5"/>` : `<rect x="92" y="78" width="16" height="16" rx="3" fill="#facc15" stroke="${O}" stroke-width="2.5"/>`;
    const lid = open
      ? `<path d="M36 72 L46 26 Q100 12 154 26 L164 72Z" fill="${shade(c.color, -45)}" ${CSW}/><path d="M48 66 L56 34 Q100 22 144 34 L152 66Z" fill="${shade(c.color, -75)}"/><path d="M42 30 Q100 14 158 30 L160 22 Q100 4 40 22Z" fill="url(#cl${u})" ${CSW}/>`
      : `<path d="M36 70 Q36 34 100 34 Q164 34 164 70Z" fill="url(#cl${u})" ${CSW}/><rect x="36" y="64" width="128" height="10" fill="${c.color}" ${CSW}/>${gem}`;
    const glow = open ? `<ellipse cx="100" cy="68" rx="56" ry="14" fill="#fffbe6" opacity=".95" class="anim-glow"/>` : '';
    return `<svg class="chest-svg${opts.cls ? ' ' + opts.cls : ''}" viewBox="20 10 160 130" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="cl${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.light}"/><stop offset="1" stop-color="${c.color}"/></linearGradient><linearGradient id="cb${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.color}"/><stop offset="1" stop-color="${shade(c.color, -50)}"/></linearGradient></defs><ellipse cx="100" cy="128" rx="66" ry="8" fill="rgba(0,0,0,.2)"/>${open ? lid + glow : ''}<rect x="36" y="70" width="128" height="54" rx="6" fill="url(#cb${u})" ${CSW}/><rect x="36" y="70" width="128" height="10" fill="${shade(c.color, -25)}" opacity=".6"/><rect x="56" y="70" width="12" height="54" fill="${shade(c.light, -10)}" ${CSW}/><rect x="132" y="70" width="12" height="54" fill="${shade(c.light, -10)}" ${CSW}/>${open ? '' : lid}${type === 'diamond' ? sparkle(48, 40, 6, '#fff', 0) + sparkle(156, 52, 5, '#fff', 0.7) : ''}</svg>`;
  }

  LC.Items = { ITEMS, BY_ID, SLOTS, RARITY, CHESTS, CHEST_ORDER, STARTERS, DEFAULT_EQUIP, SKINS, EYES };
  LC.Avatar = { render, renderItem, renderChest, sparkle };
})(typeof window !== 'undefined' ? window : globalThis);
