/* Cute monster guardians (SVG) for story battles. */
(function (root) {
  const LC = (root.LC = root.LC || {});
  const O = '#2a1d2e';
  const SW = `stroke="${O}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
  const eyes = (x1, x2, y, r, angry) => `<g class="anim-blink"><ellipse cx="${x1}" cy="${y}" rx="${r}" ry="${r * 1.2}" fill="#fff" ${SW}/><ellipse cx="${x2}" cy="${y}" rx="${r}" ry="${r * 1.2}" fill="#fff" ${SW}/><circle cx="${x1 + 1.5}" cy="${y + 1}" r="${r * 0.5}" fill="${O}"/><circle cx="${x2 - 1.5}" cy="${y + 1}" r="${r * 0.5}" fill="${O}"/></g>` + (angry ? `<path d="M${x1 - r} ${y - r * 1.6} L${x1 + r} ${y - r * 0.9} M${x2 + r} ${y - r * 1.6} L${x2 - r} ${y - r * 0.9}" stroke="${O}" stroke-width="3.5" stroke-linecap="round"/>` : '');
  const crown = (y) => `<path d="M76 ${y} L80 ${y - 24} L92 ${y - 10} L100 ${y - 30} L108 ${y - 10} L120 ${y - 24} L124 ${y}Z" fill="#ffc83d" ${SW}/><circle cx="100" cy="${y - 6}" r="4" fill="#e5484d"/>`;

  const TYPES = {
    slime: (c, boss) => `<path d="M30 150 Q22 70 100 56 Q178 70 170 150 Q100 162 30 150Z" fill="${c}" ${SW}/><ellipse cx="70" cy="86" rx="14" ry="9" fill="#fff" opacity=".45"/>${eyes(80, 120, 112, 10, boss)}<path d="M88 134 Q100 142 112 134" stroke="${O}" stroke-width="3" fill="none" stroke-linecap="round"/>${boss ? crown(62) : ''}`,
    bat: (c, boss) => `<g class="anim-flap" style="transform-origin:70px 100px"><path d="M70 100 Q30 50 6 76 Q22 84 14 98 Q30 96 30 112 Q46 104 52 120 Q62 108 74 114Z" fill="${c}" ${SW}/></g><g class="anim-flap" style="transform-origin:130px 100px"><path d="M130 100 Q170 50 194 76 Q178 84 186 98 Q170 96 170 112 Q154 104 148 120 Q138 108 126 114Z" fill="${c}" ${SW}/></g><ellipse cx="100" cy="104" rx="38" ry="36" fill="${c}" ${SW}/><path d="M72 76 L66 46 L86 70 M128 76 L134 46 L114 70" fill="${c}" ${SW}/>${eyes(86, 114, 100, 8, boss)}<path d="M92 120 L96 128 L100 120 L104 128 L108 120" stroke="${O}" stroke-width="2.5" fill="#fff" stroke-linejoin="round"/>${boss ? crown(70) : ''}`,
    goblin: (c, boss) => `<path d="M48 96 L14 80 L46 116Z M152 96 L186 80 L154 116Z" fill="${c}" ${SW}/><ellipse cx="100" cy="106" rx="54" ry="48" fill="${c}" ${SW}/><path d="M60 150 Q100 166 140 150 L136 176 Q100 186 64 176Z" fill="#7c4a1e" ${SW}/>${eyes(80, 120, 98, 9, true)}<path d="M84 128 Q100 120 116 128" stroke="${O}" stroke-width="3" fill="none"/><path d="M90 126 L92 134 L96 127 M104 127 L108 134 L110 126" fill="#fff" stroke="${O}" stroke-width="2"/>${boss ? crown(64) : ''}`,
    ghost: (c, boss) => `<g class="anim-float"><path d="M44 160 Q38 50 100 46 Q162 50 156 160 L140 148 L124 164 L108 148 L92 164 L76 148 L60 164Z" fill="${c}" ${SW}/>${eyes(82, 118, 98, 10, boss)}<ellipse cx="100" cy="128" rx="9" ry="11" fill="${O}"/><ellipse cx="66" cy="114" rx="8" ry="5" fill="#ff8fb8" opacity=".5"/><ellipse cx="134" cy="114" rx="8" ry="5" fill="#ff8fb8" opacity=".5"/>${boss ? crown(54) : ''}</g>`,
    dragon: (c, boss) => `<g class="anim-flap" style="transform-origin:60px 110px"><path d="M60 110 Q20 50 0 70 Q16 80 6 92 Q22 94 18 108 Q36 106 40 122Z" fill="#7c3aed" ${SW}/></g><g class="anim-flap" style="transform-origin:140px 110px"><path d="M140 110 Q180 50 200 70 Q184 80 194 92 Q178 94 182 108 Q164 106 160 122Z" fill="#7c3aed" ${SW}/></g><ellipse cx="100" cy="128" rx="46" ry="38" fill="${c}" ${SW}/><ellipse cx="100" cy="138" rx="26" ry="22" fill="#fde68a" ${SW}/><path d="M70 82 L62 44 L84 72 M130 82 L138 44 L116 72" fill="#fde68a" ${SW}/><ellipse cx="100" cy="90" rx="44" ry="34" fill="${c}" ${SW}/>${eyes(82, 118, 86, 9, true)}<ellipse cx="92" cy="106" rx="3" ry="2" fill="${O}"/><ellipse cx="108" cy="106" rx="3" ry="2" fill="${O}"/>${boss ? crown(58) : ''}`,
  };
  const COLORS = { slime: '#4ade80', bat: '#6d5bd0', goblin: '#84cc16', ghost: '#e2e8f0', dragon: '#ef4444' };
  const BOSS_COLORS = { slime: '#22c55e', bat: '#14b8a6', goblin: '#65a30d', ghost: '#c4b5fd', dragon: '#b91c1c' };

  function render(type, opts) {
    opts = opts || {};
    const boss = !!opts.boss;
    const c = opts.color || (boss ? BOSS_COLORS[type] : COLORS[type]) || '#4ade80';
    const body = (TYPES[type] || TYPES.slime)(c, boss);
    return `<svg class="monster-svg${boss ? ' boss' : ''}" viewBox="0 20 200 170" xmlns="http://www.w3.org/2000/svg"><ellipse cx="100" cy="176" rx="64" ry="9" fill="rgba(0,0,0,.2)"/><g class="monster-body">${body}</g></svg>`;
  }
  LC.Monsters = { render, TYPES: Object.keys(TYPES) };
})(typeof window !== 'undefined' ? window : globalThis);
