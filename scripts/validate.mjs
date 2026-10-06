import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { createRequire } from 'node:module';

// An external toolchain keeps dependencies outside restricted workspaces.
const require = createRequire(process.env.PEPES_TOOLCHAIN
  ? resolve(process.env.PEPES_TOOLCHAIN, 'package.json')
  : new URL('../package.json', import.meta.url));
const { chromium } = require('playwright');
const { default: AxeBuilder } = require('@axe-core/playwright');
const root = resolve('dist');
const expectedAddress = '0xa562b9e8c27aeb3f55e1f8bd04bfeabdcdb081e0';
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.txt': 'text/plain' };
const report = { checks: [], viewports: [], errors: [], contrast: [] };
const check = (name) => { report.checks.push(name); console.log(`PASS ${name}`); };
const expectStatus = async (page, message) => {
  await page.waitForFunction((text) => document.querySelector('#copy-status')?.textContent === text, message, { timeout: 5000 });
};
const server = createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (!path.startsWith('/preview/')) { res.writeHead(404).end(); return; }
    const relative = path.slice('/preview/'.length) || 'index.html';
    const file = resolve(root, relative);
    if (!file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' }).end(data);
  } catch { res.writeHead(404).end(); }
});

await mkdir('artifacts', { recursive: true });
await new Promise((done) => server.listen(0, '127.0.0.1', done));
const url = `http://127.0.0.1:${server.address().port}/preview/`;
let browser;
try {
  browser = await chromium.launch({ headless: true, executablePath: process.env.PEPES_CHROMIUM_EXECUTABLE });
  report.browser = browser.version();
  const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await context.newPage();
  page.on('pageerror', (error) => report.errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') report.errors.push(message.text()); });
  page.on('requestfailed', (request) => report.errors.push(`${request.url()}: ${request.failure()?.errorText}`));
  page.on('response', (response) => { if (response.status() >= 400) report.errors.push(`${response.status()} ${response.url()}`); });
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator('h1').getAttribute('aria-label'), '$PEPES');
  assert.equal(await page.locator('#contract-address').innerText(), expectedAddress);
  assert.equal((await page.locator('.contract-value').innerText()).replace(/\s+/g, ' ').trim(), `CA: ${expectedAddress}`);
  assert.equal(await page.locator('.brand img').evaluate((img) => img.complete && img.naturalWidth === 400), true);
  assert.equal(await page.evaluate(() => document.fonts.check('400 32px "Lilita One"') && document.fonts.check('800 16px Nunito')), true);
  check('Exact contract, local profile image and both local fonts load at /preview/');

  for (const [width, height] of [[1440, 1000], [1024, 768], [768, 1024], [390, 844], [320, 740]]) {
    await page.setViewportSize({ width, height });
    const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, viewport: innerWidth }));
    assert.ok(dimensions.scroll <= dimensions.viewport, `${width}px horizontal overflow`);
    const codeBox = await page.locator('#contract-address').boundingBox();
    assert.ok(codeBox.x >= 0 && codeBox.x + codeBox.width <= width);
    for (const selector of ['.menu-toggle', '.copy-button', '.community-link']) {
      const box = await page.locator(selector).boundingBox();
      assert.ok(box.width >= 44 && box.height >= 44, `${selector} target smaller than 44px`);
    }
    await page.screenshot({ path: `artifacts/viewport-${width}.jpg`, fullPage: true, type: 'jpeg', quality: 85 });
    const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    assert.deepEqual(scan.violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })) })), []);
    report.viewports.push({ width, height, overflow: false, axeViolations: scan.violations.length });
  }
  check('Five viewport sizes: no horizontal overflow, 44px targets, zero automated accessibility violations');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Copy CA' }).click();
  await expectStatus(page, 'Copied!');
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), expectedAddress);
  assert.equal(await page.getByRole('status').innerText(), 'Copied!');
  await page.screenshot({ path: 'artifacts/copied-mobile.jpg', fullPage: true, type: 'jpeg', quality: 85 });
  await expectStatus(page, '');
  await page.getByRole('button', { name: 'Copy CA' }).click();
  await expectStatus(page, 'Copied!');
  assert.equal(await page.getByRole('status').innerText(), 'Copied!');
  check('Real clipboard contains exact address; Copied! feedback clears and works on repeated copy');

  await page.goto(url);
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('.skip-link').evaluate((el) => el === document.activeElement), true);
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('.brand').evaluate((el) => el === document.activeElement), true);
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('.menu-toggle').evaluate((el) => el === document.activeElement), true);
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
  await page.keyboard.press('Tab');
  assert.equal(await page.getByRole('link', { name: /^Home/ }).evaluate((el) => el === document.activeElement), true);
  await page.screenshot({ path: 'artifacts/menu-keyboard-mobile.jpg', fullPage: true, type: 'jpeg', quality: 85 });
  const menuScan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  assert.equal(menuScan.violations.length, 0);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#site-menu').isVisible(), false);
  assert.equal(await page.locator('.menu-toggle').evaluate((el) => el === document.activeElement), true);
  await page.keyboard.press('Space');
  await page.getByRole('link', { name: /^Contract address/ }).click();
  assert.equal(new URL(page.url()).hash, '#contract');
  assert.equal(await page.locator('#contract').evaluate((el) => el === document.activeElement), true);
  assert.equal(await page.locator('#site-menu').isVisible(), false);
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.mouse.click(5, 400);
  assert.equal(await page.locator('#site-menu').isVisible(), false);
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('#site-menu').isVisible(), false);
  assert.equal(await page.locator('.copy-button').evaluate((el) => el === document.activeElement), true);
  await page.keyboard.press('Enter');
  await expectStatus(page, 'Copied!');
  assert.equal(await page.getByRole('status').innerText(), 'Copied!');
  check('Keyboard sequence, Enter/Space, Escape focus return, anchor navigation, outside click and focus-out dismissal');

  await page.goto(url);
  await page.setViewportSize({ width: 320, height: 740 });
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.getByRole('button', { name: 'Copy CA' }).click();
  await expectStatus(page, 'Copied!');
  assert.equal(await page.getByRole('status').innerText(), 'Copied!');
  await page.screenshot({ path: 'artifacts/text-200-percent.jpg', fullPage: true, type: 'jpeg', quality: 80 });
  check('200% root text sizing at 320px: no overflow and copy remains usable (not native browser zoom)');

  await page.goto(url);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await page.locator('.copy-button').evaluate((el) => getComputedStyle(el).transitionDuration), '0s');
  await page.emulateMedia({ forcedColors: 'active' });
  await page.locator('.copy-button').focus();
  assert.notEqual(await page.locator('.copy-button').evaluate((el) => getComputedStyle(el).outlineStyle), 'none');
  await page.screenshot({ path: 'artifacts/forced-colors.jpg', fullPage: true, type: 'jpeg', quality: 80 });
  await page.emulateMedia({ reducedMotion: 'no-preference', forcedColors: 'none' });
  check('Reduced motion disables transitions; forced colors preserves focus and control boundaries');

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(url);
  const styles = await page.evaluate(() => {
    const css = getComputedStyle(document.documentElement);
    return { bg: css.getPropertyValue('--green-600').trim(), surface: css.getPropertyValue('--green-700').trim(), hover: css.getPropertyValue('--green-500').trim(), secondary: css.getPropertyValue('--green-100').trim(), white: '#ffffff', silhouetteOpacity: Number(getComputedStyle(document.querySelector('.frog-backdrop svg')).opacity) };
  });
  const rgb = (hex) => hex.slice(1).match(/../g).map((v) => parseInt(v, 16));
  const luminance = (color) => rgb(color).map((value) => value / 255).map((v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4).reduce((total, v, i) => total + v * [0.2126, 0.7152, 0.0722][i], 0);
  const contrast = (a, b) => { const l = [luminance(a), luminance(b)].sort((a, b) => b - a); return (l[0] + 0.05) / (l[1] + 0.05); };
  const composite = '#' + rgb(styles.bg).map((v) => Math.round(v * (1 - styles.silhouetteOpacity) + 255 * styles.silhouetteOpacity).toString(16).padStart(2, '0')).join('');
  for (const [name, fg, bg] of [
    ['Main white text / page', styles.white, styles.bg],
    ['Secondary text / page', styles.secondary, styles.bg],
    ['Secondary text / lightest silhouette composite', styles.secondary, composite],
    ['White text / contract and menu', styles.white, styles.surface],
    ['White text / hover', styles.white, styles.hover],
    ['Copy button text / default', styles.surface, styles.white],
    ['Copy button text / hover', styles.surface, styles.secondary],
  ]) {
    const ratio = contrast(fg, bg);
    report.contrast.push({ name, fg, bg, ratio: Number(ratio.toFixed(2)) });
    assert.ok(ratio >= 4.5, `${name} contrast ${ratio} below 4.5:1`);
  }
  check('Measured all text color roles, hover pairs and worst-case silhouette compositing above 4.5:1');

  assert.equal(await page.locator('.community-link').getAttribute('href'), 'https://x.com/pepes_imd');
  assert.equal(await page.locator('.community-link').getAttribute('target'), '_blank');
  assert.equal(await page.locator('.footer a').getAttribute('href'), 'https://imd.fun/');
  check('External community and IMD destinations and new-tab labels');

  for (const mode of ['legacy', 'denied', 'rejected']) {
    const fallbackContext = await browser.newContext();
    await fallbackContext.addInitScript(({ mode }) => {
      Object.defineProperty(navigator, 'clipboard', { value: mode === 'rejected' ? { writeText: async () => { throw new Error('Clipboard permission denied'); } } : undefined, configurable: true });
      document.execCommand = (command) => {
        window.__copied = command === 'copy' ? document.querySelector('textarea')?.value : undefined;
        return mode !== 'denied';
      };
    }, { mode });
    const fallbackPage = await fallbackContext.newPage();
    await fallbackPage.goto(url);
    await fallbackPage.getByRole('button', { name: 'Copy CA' }).click();
    assert.equal(await fallbackPage.evaluate(() => window.__copied), expectedAddress);
    await expectStatus(fallbackPage, mode === 'denied' ? 'Copy unavailable. Select and copy the address above.' : 'Copied!');
    assert.equal(await fallbackPage.locator('textarea').count(), 0);
    assert.equal(await fallbackPage.locator('.copy-button').evaluate((el) => el === document.activeElement), true);
    if (mode === 'denied') await fallbackPage.screenshot({ path: 'artifacts/copy-unavailable.jpg', fullPage: true, type: 'jpeg', quality: 80 });
    await fallbackContext.close();
  }
  check('Simulated missing and rejected Clipboard API: legacy exact-value copy and actionable failure; focus restored, temporary field removed');

  const touchContext = await browser.newContext({ isMobile: true, hasTouch: true, viewport: { width: 390, height: 844 }, permissions: ['clipboard-read', 'clipboard-write'] });
  const touchPage = await touchContext.newPage();
  await touchPage.goto(url);
  await touchPage.getByRole('button', { name: 'Copy CA' }).tap();
  await expectStatus(touchPage, 'Copied!');
  assert.equal(await touchPage.evaluate(() => navigator.clipboard.readText()), expectedAddress);
  await touchPage.getByRole('button', { name: 'Open menu' }).tap();
  assert.equal(await touchPage.locator('#site-menu').isVisible(), true);
  await touchContext.close();
  check('Touch emulation: tap copies exact address and opens navigation');

  const noJsContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 740 } });
  const noJsPage = await noJsContext.newPage();
  await noJsPage.goto(url);
  assert.equal(await noJsPage.locator('#contract-address').innerText(), expectedAddress);
  assert.equal(await noJsPage.locator('.no-script').isVisible(), true);
  assert.equal(await noJsPage.locator('.copy-button').isVisible(), false);
  assert.equal(await noJsPage.locator('.community-link').isVisible(), true);
  await noJsContext.close();
  check('Without JavaScript, full content and external links remain available with manual-copy instructions');
  assert.deepEqual(report.errors, []);
  check('No browser console errors, page exceptions, failed requests or HTTP errors');
  report.result = 'PASS';
} catch (error) {
  report.result = 'FAIL';
  report.failure = error.stack;
  console.error(error);
  process.exitCode = 1;
} finally {
  await writeFile('artifacts/browser-results.json', JSON.stringify(report, null, 2) + '\n');
  await browser?.close();
  await new Promise((done) => server.close(done));
}
