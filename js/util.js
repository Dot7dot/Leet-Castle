/* Small shared utilities. */
(function (root) {
  const LC = (root.LC = root.LC || {});
  function dedent(src) {
    const lines = String(src).replace(/\t/g, '    ').split('\n');
    while (lines.length && !lines[0].trim()) lines.shift();
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    // function.toString(): first line has no indentation, the rest keep the file's indentation
    const rest = lines.slice(1).filter((l) => l.trim());
    let min = Infinity;
    const candidates = /^\s/.test(lines[0] || '') ? lines.filter((l) => l.trim()) : rest;
    for (const l of candidates) min = Math.min(min, l.match(/^ */)[0].length);
    if (!Number.isFinite(min)) min = 0;
    if (!/^\s/.test(lines[0] || '')) {
      const last = lines[lines.length - 1] || '';
      const closeIndent = last.match(/^ */)[0].length;
      min = Math.min(min, closeIndent);
      return [lines[0]].concat(lines.slice(1).map((l) => l.slice(Math.min(min, l.match(/^ */)[0].length)))).join('\n');
    }
    return lines.map((l) => l.slice(Math.min(min, l.match(/^ */)[0].length))).join('\n');
  }
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function solutionCode(P, lang) {
    if (lang === 'python') return dedent(P.py || '');
    return dedent(P.ref.toString());
  }
  function fmtVal(v) {
    return JSON.stringify(v, (k, x) => (typeof x === 'number' && !Number.isFinite(x) ? String(x) : x));
  }
  function fmtArgs(P, args) {
    if (!P.params.length) return '（無輸入）';
    return P.params.map((p, i) => p[0] + ' = ' + fmtVal(args[i])).join(', ');
  }
  function fmtTime(ms) {
    const s = Math.round(ms / 1000);
    const m = Math.floor(s / 60);
    return (m ? m + ' 分 ' : '') + (s % 60) + ' 秒';
  }
  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  LC.util = { dedent, esc, solutionCode, fmtVal, fmtArgs, fmtTime, hashStr };
})(typeof window !== 'undefined' ? window : globalThis);
