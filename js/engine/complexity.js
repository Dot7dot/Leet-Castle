/* Empirical complexity estimation: fit (n, cost) samples against candidate growth functions. */
(function (root) {
  const LC = (root.LC = root.LC || {});

  const CLASSES = [
    { key: '1', label: 'O(1)', f: () => 1 },
    { key: 'logn', label: 'O(log n)', f: (n) => Math.log2(n + 1) },
    { key: 'sqrtn', label: 'O(√n)', f: (n) => Math.sqrt(n) },
    { key: 'n', label: 'O(n)', f: (n) => n },
    { key: 'nlogn', label: 'O(n log n)', f: (n) => n * Math.log2(n + 1) },
    { key: 'n^2', label: 'O(n²)', f: (n) => n * n },
    { key: 'n^2logn', label: 'O(n² log n)', f: (n) => n * n * Math.log2(n + 1) },
    { key: 'n^3', label: 'O(n³)', f: (n) => n * n * n },
    { key: '2^n', label: 'O(2ⁿ)', f: (n) => Math.pow(2, n) },
    { key: 'n2^n', label: 'O(n·2ⁿ)', f: (n) => n * Math.pow(2, n) },
    { key: 'n!', label: 'O(n!)', f: (n) => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; } },
  ];
  const INDEX = Object.fromEntries(CLASSES.map((c, i) => [c.key, i]));

  function fitOne(pts, f) {
    // weighted least squares on y ≈ a·f(n) + b, weights 1/y² (relative error)
    let Sw = 0, Sx = 0, Sy = 0, Sxx = 0, Sxy = 0;
    for (const p of pts) {
      const x = f(p.n), y = p.y, w = 1 / Math.max(1, y) ** 2;
      Sw += w; Sx += w * x; Sy += w * y; Sxx += w * x * x; Sxy += w * x * y;
    }
    const det = Sw * Sxx - Sx * Sx;
    let a, b;
    if (Math.abs(det) < 1e-12 * Math.max(1, Sw * Sxx)) { a = 0; b = Sy / Sw; }
    else { a = (Sw * Sxy - Sx * Sy) / det; b = (Sy - a * Sx) / Sw; }
    if (a < 0) { a = 0; b = Sy / Sw; }
    // symmetric error in log space: over- and under-estimating by the same factor cost the same
    let err = 0;
    for (const p of pts) {
      const pred = a * f(p.n) + b;
      const e = pred <= 0 ? 5 : Math.log(Math.max(1, pred) / Math.max(1, p.y));
      err += e * e;
    }
    return { a, b, err: Math.sqrt(err / pts.length) };
  }

  /**
   * pts: [{n, y}], sorted by n. `censored`: true when the next size exceeded the budget
   * (which tells us growth is at least as fast as what we observed).
   */
  function estimate(pts, opts) {
    opts = opts || {};
    pts = pts.filter((p) => p.n > 0 && Number.isFinite(p.y)).sort((a, b) => a.n - b.n);
    if (pts.length < 2) return { key: opts.censored ? 'n^2' : '1', confidence: 0 };
    const ys = pts.map((p) => p.y);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const span = pts[pts.length - 1].n / pts[0].n;
    // essentially flat
    const flatAbs = opts.flatAbs === undefined ? 3 : opts.flatAbs;
    if (maxY - minY <= flatAbs || maxY <= minY * (opts.flatRel || 1.12)) return { key: '1', confidence: 1 };
    const maxIdx = opts.maxClass ? INDEX[opts.maxClass] : CLASSES.length - 1;
    const fits = [];
    for (let i = 1; i <= maxIdx; i++) {
      const c = CLASSES[i];
      // exponential candidates only make sense for small n
      if (i >= INDEX['2^n'] && pts[pts.length - 1].n > 40) continue;
      if (i < INDEX['2^n'] && opts.exponential) continue;
      const r = fitOne(pts, c.f);
      fits.push({ i, key: c.key, err: r.err, a: r.a });
    }
    fits.sort((x, y) => x.err - y.err);
    let best = fits[0];
    // prefer the simpler class when errors are close
    for (const f of fits) {
      if (f.i < best.i && f.err <= best.err * 1.35 + 0.01) best = f;
    }
    // the log-log slope of the largest sizes protects against "constant + slow growth" confusion
    const k = pts.length;
    const p1 = pts[Math.max(0, k - 3)], p2 = pts[k - 1];
    const slope = Math.log(Math.max(1, p2.y) / Math.max(1, p1.y)) / Math.log(p2.n / p1.n);
    if (!opts.exponential && best.i >= INDEX['n'] && slope < 0.55) best = fits.find((f) => f.key === (slope < 0.3 ? 'logn' : 'sqrtn')) || best;
    return { key: best.key, confidence: Math.max(0, 1 - best.err * 3), slope, span };
  }

  LC.Complexity = {
    CLASSES, INDEX, estimate,
    label(key, labels) { if (labels && labels[key]) return labels[key]; const c = CLASSES[INDEX[key]]; return c ? c.label : key; },
    compare(a, b) { return INDEX[a] - INDEX[b]; },
  };
})(typeof window !== 'undefined' ? window : globalThis);
