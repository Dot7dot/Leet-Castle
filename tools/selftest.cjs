#!/usr/bin/env node
/*
 * Headless self-test: runs every problem's reference solution (JavaScript and/or Python) through the
 * real in-browser judge (selftest.html) and checks that all tests pass and that the measured
 * complexity is not worse than the problem's stated optimum.
 *
 *   npm i -D playwright            # once (or use a globally installed playwright)
 *   node tools/selftest.cjs [javascript|python|both] [problem-id,problem-id]
 *
 * Optional: PYODIDE_URL=http://host/path/to/pyodide/ to use a local Pyodide build instead of the CDN.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.wasm': 'application/wasm', '.zip': 'application/zip' };

const server = http.createServer((req, res) => {
  const file = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

server.listen(0, async () => {
  const port = server.address().port;
  const lang = process.argv[2] || 'javascript';
  const only = process.argv[3] ? '&only=' + process.argv[3] : '';
  const py = process.env.PYODIDE_URL ? '&pyodide=' + encodeURIComponent(process.env.PYODIDE_URL) : '';
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error('page error:', e.message));
  await page.goto(`http://localhost:${port}/selftest.html?lang=${lang}${only}${py}`);
  await page.waitForFunction(() => window.__selftest && window.__selftest.done, null, { timeout: 30 * 60 * 1000, polling: 2000 });
  const r = await page.evaluate(() => window.__selftest);
  for (const x of r.report) {
    const bad = x.status !== 'AC' || x.tCls === 'bad' || x.sCls === 'bad';
    const warn = x.tCls === 'warn' || x.sCls === 'warn';
    if (bad || warn || process.env.VERBOSE) {
      console.log(`${bad ? 'FAIL' : warn ? 'warn' : ' ok '}  ${x.id.padEnd(28)} ${x.lang.padEnd(10)} ${x.status} time ${x.time}/${x.optTime} space ${x.space}/${x.optSpace} ${x.info || ''}`.slice(0, 240));
    }
  }
  console.log(`\n${r.report.length} runs, ${r.bad} failing, ${r.warn} warnings (warning = measured better than the stated optimum)`);
  await browser.close();
  server.close();
  process.exit(r.bad ? 1 : 0);
});
