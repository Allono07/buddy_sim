import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
for (const width of [1440, 768, 390, 320]) {
  await page.setViewportSize({ width, height: 850 });
  await page.goto("http://localhost:5173/");
  await page.waitForTimeout(1750);
  assert.equal(await page.locator(".wordmark h1").textContent(), "trashbuddy");
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  assert.equal(
    await page
      .locator("#bin-lid")
      .evaluate((e) => getComputedStyle(e).transform),
    "none",
  );
  assert.notEqual(
    await page
      .locator(".hero-bin-pose")
      .evaluate((e) => getComputedStyle(e).transform),
    "none",
  );
  await page
    .locator(".hero")
    .screenshot({ path: `/tmp/hero-update-${width}.png` });
}
await page.emulateMedia({ reducedMotion: "reduce" });
await page.reload();
await page.waitForTimeout(500);
assert.equal(
  await page
    .locator(".hero-bin-pose")
    .evaluate((e) => getComputedStyle(e).transform),
  "none",
);
assert.equal(
  await page.locator("#bin-lid").evaluate((e) => getComputedStyle(e).transform),
  "none",
);
assert.deepEqual(errors, []);
console.log(
  "Hero verified at 1440, 768, 390 and 320px; lowercase wordmark, flush lid, tilted idle, reduced-motion still pose, no overflow or runtime errors.",
);
await browser.close();
