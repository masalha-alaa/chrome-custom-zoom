// Development-only rendering. Requires Playwright; never included in the extension ZIP.
// The production popup files are rendered with deterministic Chrome API fixtures.
// This is not an installed-extension integration test.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'store/assets');
const dataImage = file => 'data:image/png;base64,' + fs.readFileSync(file).toString('base64');

async function main() {
  fs.mkdirSync(out, { recursive: true });
  fs.mkdirSync(path.join(root, 'docs/assets'), { recursive: true });
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
    args: process.env.CHROMIUM_NO_SANDBOX === '1' ? ['--no-sandbox', '--disable-gpu'] : []
  });
  try {
    const context = await browser.newContext({ viewport: { width: 238, height: 198 }, deviceScaleFactor: 3 });
    const popup = await context.newPage();
    await popup.addInitScript(() => {
      let zoom = 1.2;
      const saved = { zoomStep: 5, zoomPresets: [80, 100, 120, 150, 200] };
      window.chrome = {
        tabs: {
          query: async () => [{ id: 1 }],
          getZoom: async () => zoom,
          getZoomSettings: async () => ({ defaultZoomFactor: 1 }),
          setZoom: async (_id, value) => { zoom = value || 1; }
        },
        storage: { local: {
          get: async () => structuredClone(saved),
          set: async values => Object.assign(saved, structuredClone(values))
        } }
      };
    });
    await popup.goto(pathToFileURL(path.join(root, 'popup.html')).href);
    await popup.waitForFunction(() => document.querySelectorAll('.preset-row').length === 5);
    await popup.locator('body').screenshot({ path: path.join(root, 'docs/assets/popup.png') });
    await popup.getByRole('button', { name: 'Remove 120% preset', exact: true }).click();
    await popup.waitForFunction(() => document.querySelector('.preset-row:nth-child(3) .preset-star').getAttribute('aria-pressed') === 'false');
    await popup.locator('body').screenshot({ path: path.join(out, 'popup-unstarred.png') });
    await context.close();

    const page = await browser.newPage();
    const icon = dataImage(path.join(root, 'icons/zoom-128.png'));
    const fullPopup = dataImage(path.join(root, 'docs/assets/popup.png'));
    const unstarred = dataImage(path.join(out, 'popup-unstarred.png'));
    const styles = `*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;background:#0d1523;color:#f0f5ff}main{height:100vh;position:relative;overflow:hidden}h1{font-size:64px;line-height:1.08;letter-spacing:-2px;margin:24px 0}p{font-size:24px;line-height:1.5;color:#b1c4de;max-width:510px}.brand{display:flex;align-items:center;gap:14px;font-size:23px;font-weight:bold}.brand img{width:54px;height:54px}.eyebrow{font-size:14px;letter-spacing:3px;font-weight:bold;color:#9ec4ff}.copy{position:absolute;left:78px;top:69px;width:520px}.art{position:absolute;right:58px;top:174px;padding:54px 28px 30px;background:radial-gradient(ellipse at top,#304f79,#18283f);border:1px solid #3e5573;border-radius:24px;text-align:center}.art img{display:block;width:476px;border-radius:12px;box-shadow:0 24px 48px #0005}.caption{font-size:13px;color:#a5b8d2;margin:24px 0 0}.chips{display:flex;gap:12px;margin-top:34px}.chips span{border:1px solid #3a526f;color:#bad4f8;border-radius:8px;padding:10px 15px;font-size:17px}.foot{position:absolute;left:78px;bottom:50px;font-size:15px;color:#849ab7}`;
    const shots = [
      ['screenshot-01-1280x800.png', 'EXACT PAGE ZOOM', 'Your zoom.<br>Your choice.', 'Type the percentage you want.<br>Adjust it in steps that suit you.<br>Save your favorites with a star.', fullPopup, ['25%–500%', 'Custom steps', 'Five presets']],
      ['screenshot-02-1280x800.png', 'FAVORITES, ONE CLICK AWAY', 'Save. Apply.<br>Make it yours.', 'Keep up to five sorted presets.<br>Click a percentage to apply it.<br>Unstar to remove it on reopening.', unstarred, ['Sorted presets', 'One-click zoom']]
    ];
    for (const [filename, eyebrow, heading, body, img, chips] of shots) {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.setContent(`<style>${styles}</style><main><div class="copy"><div class="brand"><img src="${icon}">Chrome Custom Zoom</div><div class="eyebrow" style="margin-top:74px">${eyebrow}</div><h1>${heading}</h1><p>${body}</p><div class="chips">${chips.map(x=>`<span>${x}</span>`).join('')}</div></div><div class="art"><img src="${img}"><div class="caption">Extension popup · enlarged for clarity</div></div><div class="foot">Local preferences. No account. No analytics.</div></main>`);
      await page.screenshot({ path: path.join(out, filename) });
    }
    // Brand graphics built in HTML/CSS from the existing icon, not generated imagery.
    for (const [filename, w, h, marquee] of [
      ['small-promo-440x280.png', 440, 280, false],
      ['marquee-1400x560.png', 1400, 560, true]
    ]) {
      await page.setViewportSize({ width: w, height: h });
      await page.setContent(`<style>${styles}.promo{display:flex;align-items:center;justify-content:center;gap:${marquee?82:26}px;background:radial-gradient(ellipse at 30% 40%,#27517c,#121d31 75%)}.mark{width:${marquee?250:138}px}.levels{display:flex;flex-direction:column;gap:${marquee?16:10}px}.level{font-weight:bold;color:#91b7eb;font-size:${marquee?30:20}px;letter-spacing:1px}.level.active{color:#f2f7ff;font-size:${marquee?64:36}px}.star{color:#b5d5ff;margin-left:${marquee?32:16}px}.headline{font-size:54px;font-weight:bold;letter-spacing:-1px;margin:0 0 16px}.tag{font-size:25px;margin:0;color:#b1c4de}</style><main class="promo"><img class="mark" src="${icon}">${marquee?'<div><div class="headline">Chrome Custom Zoom</div><p class="tag">Exact percentages. Your own steps. Favorite presets.</p></div>':''}<div class="levels"><div class="level">100%<span class="star">☆</span></div><div class="level active">120%<span class="star">★</span></div><div class="level">150%<span class="star">☆</span></div></div></main>`);
      await page.screenshot({ path: path.join(out, filename) });
    }
    console.log('Created two 1280×800 screenshots, 440×280 promo, 1400×560 marquee, and popup captures.');
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
