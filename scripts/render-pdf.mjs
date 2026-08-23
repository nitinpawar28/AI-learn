/**
 * Render the AI-learn print page to an A4 PDF.
 *
 * Drives the Chrome already installed on this machine via puppeteer-core, so
 * nothing large is downloaded. Chrome's own --print-to-pdf CLI cannot produce
 * custom page numbers (it does not implement CSS Paged Media margin boxes),
 * which is the reason for using the DevTools protocol instead.
 *
 * Usage:  node scripts/render-pdf.mjs <url> <output.pdf>
 */

import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const URL = process.argv[2] ?? 'http://127.0.0.1:8777/print_page/';
const OUT = process.argv[3] ?? 'AI-learn.pdf';

const CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
];

const executablePath =
  process.env.CHROME_PATH ?? CANDIDATES.find((p) => existsSync(p));

if (!executablePath) {
  console.error('No Chrome/Edge found. Set CHROME_PATH to the browser binary.');
  process.exit(1);
}
console.log(`browser : ${executablePath}`);
console.log(`source  : ${URL}`);

const browser = await puppeteer.launch({
  executablePath,
  headless: 'new',
  // Rendering 77 Mermaid diagrams occupies Chrome's main thread for minutes at
  // a time. DevTools calls issued while it is busy queue up behind that work,
  // so the default 180 s protocol timeout aborts the run. Disable it.
  protocolTimeout: 0,
  args: [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--font-render-hinting=none',
    '--js-flags=--max-old-space-size=4096',
  ],
});

const page = await browser.newPage();
page.on('console', (m) => {
  const t = m.text();
  if (/error/i.test(t)) console.log(`  page console: ${t.slice(0, 160)}`);
});

// Block Material's own JavaScript bundle.
//
// Material rewrites each <pre class="mermaid"><code>source</code></pre> into an
// empty <div class="mermaid">, then dynamically imports Mermaid from a CDN to
// fill it. That import does not complete in headless, so the source is
// destroyed and nothing replaces it — every diagram renders blank.
//
// A print page needs Material's stylesheet, not its interactivity: with the
// bundle blocked, the diagram sources survive in the DOM, <details> stay as
// plain elements, and tab panels stay as radio inputs the print CSS can reveal.
let blocked = 0;
await page.setRequestInterception(true);
page.on('request', (req) => {
  const url = req.url();
  if (/assets\/javascripts\/bundle\.[a-f0-9]+\.min\.js/.test(url)) {
    blocked++;
    req.abort();
  } else {
    req.continue();
  }
});

// 'networkidle0' never settles once a request is aborted, so wait for the DOM
// and then give stylesheets and fonts a moment. Mermaid is driven manually
// below, so there is no async rendering to wait on here.
await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 180_000 });
await new Promise((r) => setTimeout(r, 3000));
console.log(`chrome  : blocked ${blocked} Material bundle request(s)`);

const expected = await page.$$eval('.mermaid', (els) => els.length);
console.log(`diagrams: ${expected} Mermaid blocks found`);

// Material lazy-loads Mermaid from a CDN from inside its own bundle, and that
// import does not fire reliably in headless. Inject the local copy instead and
// drive rendering ourselves: deterministic, offline, and no CDN dependency.
const MERMAID = join(
  dirname(fileURLToPath(import.meta.url)),
  'node_modules', 'mermaid', 'dist', 'mermaid.min.js',
);
if (!existsSync(MERMAID)) {
  console.error(`mermaid not found at ${MERMAID} — run: npm install --prefix scripts`);
  await browser.close();
  process.exit(1);
}
await page.addScriptTag({ path: MERMAID });

const result = await page.evaluate(async () => {
  const m = window.mermaid;
  if (!m) return { error: 'mermaid did not attach to window' };

  m.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    flowchart: { htmlLabels: true, useMaxWidth: true },
    sequence: { useMaxWidth: true },
    er: { useMaxWidth: true },
    fontFamily: 'Roboto, system-ui, sans-serif',
  });

  const blocks = [...document.querySelectorAll('.mermaid')];
  let ok = 0;
  const failures = [];

  for (const [i, el] of blocks.entries()) {
    if (el.querySelector('svg')) { ok++; continue; }
    // With Material's bundle blocked the element is still the original
    // <pre class="mermaid"><code>source</code></pre>.
    const src = (el.textContent || '').trim();
    if (!src) { failures.push(`#${i} empty source`); continue; }
    try {
      const { svg } = await m.render(`pdfdiag${i}`, src);
      const holder = document.createElement('div');
      holder.className = 'mermaid';
      holder.innerHTML = svg;
      el.replaceWith(holder);
      ok++;
    } catch (e) {
      failures.push(`#${i} ${String(e).replace(/\s+/g, ' ').slice(0, 80)}`);
    }
  }
  return { ok, total: blocks.length, failures };
});

if (result.error) {
  console.error(result.error);
  await browser.close();
  process.exit(1);
}
console.log(`diagrams: ${result.ok}/${result.total} rendered`);
for (const f of result.failures) console.log(`  failed: ${f}`);
if (result.ok < result.total) {
  console.error(`${result.total - result.ok} diagram(s) failed to render`);
  await browser.close();
  process.exit(1);
}




// Force every collapsed <details> open. The stylesheet handles the visual
// side, but opening them in the DOM guarantees layout is computed for print.
const opened = await page.$$eval('details', (ds) => {
  ds.forEach((d) => d.setAttribute('open', ''));
  return ds.length;
});
console.log(`details : ${opened} expanded`);

// Reveal every tab panel and label it, so both language tracks print.
const tabs = await page.evaluate(() => {
  let panels = 0;
  document.querySelectorAll('.tabbed-set').forEach((set) => {
    const labels = [...set.querySelectorAll('.tabbed-labels > label')].map(
      (l) => l.textContent.trim(),
    );
    const blocks = [...set.querySelectorAll('.tabbed-content > .tabbed-block')];
    blocks.forEach((b, i) => {
      b.style.display = 'block';
      if (labels[i]) {
        const h = document.createElement('p');
        h.textContent = labels[i];
        h.style.cssText =
          'font-weight:700;margin:.6em 0 .2em;font-size:9.5pt;color:#333;';
        b.prepend(h);
      }
      panels++;
    });
  });
  return panels;
});
console.log(`tabs    : ${tabs} panels revealed and labelled`);

await page.emulateMediaType('print');

await page.pdf({
  path: OUT,
  format: 'A4',
  printBackground: true,
  preferCSSPageSize: false,
  displayHeaderFooter: true,
  margin: { top: '18mm', right: '18mm', bottom: '20mm', left: '18mm' },
  headerTemplate: '<div></div>',
  footerTemplate: `
    <div style="width:100%;font-family:Roboto,system-ui,sans-serif;
                font-size:8.5pt;color:#777;padding:0 18mm;
                display:flex;justify-content:space-between;">
      <span style="flex:1"></span>
      <span style="flex:0 0 auto"><span class="pageNumber"></span></span>
      <span style="flex:1;text-align:right;font-size:7.5pt;color:#aaa;">AI-learn</span>
    </div>`,
  timeout: 300_000,
});

await browser.close();
console.log(`written : ${OUT}`);
