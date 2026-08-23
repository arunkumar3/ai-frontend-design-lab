/* Interaction-state checks for /v7.
 *
 *   pnpm states:v7          (dev server must be up on :5173)
 *
 * These cover the surfaces no other instrument here can see. `impeccable`
 * scores /v7 at 0 with every one of them missing, `verify:v7` reads text
 * against data, and `contrast:v7` reads colour pairs — none of them look at
 * hover, press, or the chrome the browser draws.
 *
 * Two notes earned the hard way, both while writing this file:
 *
 * 1. `dispatchEvent('mouseover')` does NOT drive CSS :hover. It fires the JS
 *    event and leaves the pointer where it was, so the touch check below
 *    passed with the gating deliberately deleted. Use locator.hover(), which
 *    moves the virtual mouse. Watched it go red before trusting it.
 * 2. A rule whose value is a `var()` reads back empty from
 *    `.style.backgroundColor`. Read `cssText`. And assert the caret against
 *    the theme's own resolved --accent: headless defaults to light, where the
 *    accent is #4f5a00, not the #e6ff41 of the dark palette.
 *
 * Not reachable in this sandbox: .v7-poster and .v7-card__meta. image.tmdb.org
 * is blocked, so every card renders the designed fallback tile and the
 * poster-zoom path never mounts. Their transition values are asserted from the
 * CSSOM instead of from motion. See HANDOFF.md section 4.
 */
import { chromium, devices } from 'playwright';

const URL = process.env.V7_URL || 'http://localhost:5173/v7';
const out = [];
const ok = (c, n, d = '') => out.push(`${c ? 'PASS' : 'FAIL'}  ${n}${d ? '  →  ' + d : ''}`);

const browser = await chromium.launch();

// ---------------------------------------------------------------- desktop ---
let page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto(URL, { waitUntil: 'networkidle' });

const selection = await page.evaluate(() => {
  for (const sheet of document.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; }
    for (const rule of rules || []) {
      if (rule.selectorText?.includes('::selection') && rule.selectorText.includes('v7-page')) return rule.cssText;
    }
  }
  return null;
});
ok(!!selection && /background/.test(selection), '::selection is themed', selection || 'absent');

const caret = await page.$eval('.v7-page', (el) => {
  const cs = getComputedStyle(el);
  const probe = document.createElement('i');
  probe.style.color = cs.getPropertyValue('--accent').trim();
  document.body.appendChild(probe);
  const accent = getComputedStyle(probe).color;
  probe.remove();
  return { caret: cs.caretColor, accent };
});
ok(caret.caret === caret.accent, 'caret is the accent', `${caret.caret} vs ${caret.accent}`);

const scrollbar = await page.$eval('.v7-page', (el) => getComputedStyle(el).scrollbarColor);
ok(scrollbar && scrollbar !== 'auto', 'scrollbar is themed', scrollbar);

ok((await page.$eval('.v7-hero__title', (el) => getComputedStyle(el).textWrap)) === 'balance', 'hero title balances');
ok((await page.$eval('.v7-hero__sub', (el) => getComputedStyle(el).textWrap)) === 'pretty', 'hero sub sets pretty');

const easeInOut = await page.evaluate(() => {
  const hits = [];
  for (const sheet of document.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; }
    for (const rule of rules || []) {
      if (rule.cssText?.includes('.v7-') && /ease-in-out/.test(rule.cssText)) hits.push(rule.selectorText || rule.conditionText);
    }
  }
  return hits;
});
ok(easeInOut.length === 0, 'no ease-in-out survives on v7', easeInOut.join(', ') || 'none');

const activeRules = await page.evaluate(() => {
  let n = 0;
  const walk = (rules) => {
    for (const rule of rules || []) {
      if (rule.selectorText?.includes(':active')) n++;
      if (rule.cssRules) walk(rule.cssRules);
    }
  };
  for (const sheet of document.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; }
    walk(rules);
  }
  return n;
});
ok(activeRules > 0, 'press feedback exists', `${activeRules} :active rules`);

const gated = await page.evaluate(() => {
  let n = 0;
  for (const sheet of document.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; }
    for (const rule of rules || []) {
      if (/hover: *hover/.test(rule.conditionText || '') && rule.cssText.includes('.v7-')) n++;
    }
  }
  return n;
});
ok(gated >= 9, 'every hover block is gated behind (hover: hover)', `${gated} blocks`);

await page.locator('.v7-cal__hit').first().hover();
await page.waitForTimeout(350);
ok(
  (await page.$eval('.v7-cal__hit', (el) => getComputedStyle(el).transform)) !== 'none',
  'a fine pointer still gets the hover',
);
await page.close();

// ------------------------------------------------------------------ touch ---
page = await (await browser.newContext({ ...devices['Pixel 7'] })).newPage();
await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);

ok(
  !(await page.evaluate(() => matchMedia('(hover: hover) and (pointer: fine)').matches)),
  'the touch context reports no fine-hover',
);
await page.locator('.v7-cal__hit').first().hover();
await page.waitForTimeout(350);
const stuck = await page.$eval('.v7-cal__hit', (el) => getComputedStyle(el).transform);
ok(stuck === 'none' || stuck === 'matrix(1, 0, 0, 1, 0, 0)', 'a tap leaves no stuck hover state', stuck);

await browser.close();

console.log(out.join('\n'));
const failing = out.filter((l) => l.startsWith('FAIL')).length;
console.log(`\n${failing} failing check(s)`);
process.exit(failing ? 1 : 0);
