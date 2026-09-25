import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://localhost:5173");
await page.waitForTimeout(1600);
await page.screenshot({ path: "/tmp/trashbuddy-home.png", fullPage: true });
assert.equal(await page.locator("#bin-lid").count(), 1);
await page.getByRole("link", { name: "Try the simulation" }).click();
await page.getByRole("button", { name: "Get Started" }).click();
await page.getByRole("button", { name: "Got it!" }).click();
await page.getByRole("button", { name: "Bring Trucks Online" }).click();
await page.getByRole("button", { name: "Start Truck", exact: true }).click();
await page.waitForTimeout(1500);
await page.getByRole("button", { name: "Pause", exact: true }).click();
await page.getByRole("button", { name: "Resume", exact: true }).click();
await page.screenshot({
  path: "/tmp/trashbuddy-dashboard.png",
  fullPage: true,
});
await page
  .getByText("Arrived", { exact: true })
  .first()
  .waitFor({ timeout: 25000 });
await page.getByRole("button", { name: "Controls", exact: true }).click();
await page
  .getByRole("button", { name: "Voice call Simulate the call now" })
  .click();
await page.getByText("Voice Call (Simulated)", { exact: true }).waitFor();
await page.getByRole("button", { name: "Dismiss alert" }).click();
await page.getByRole("button", { name: "Update Location" }).click();
await page.getByLabel("Latitude", { exact: true }).fill("13.0000");
await page.getByRole("button", { name: "Confirm Location" }).click();
await page.getByRole("link", { name: "Your Story", exact: true }).click();
await page.route("https://api.emailjs.com/**", (r) =>
  r.fulfill({ status: 200, body: "OK" }),
);
await page.getByLabel("Area / Location").fill("Bengaluru");
await page
  .getByLabel("Problem Description")
  .fill("Test report intercepted locally.");
await page.getByRole("button", { name: "Submit Problem" }).click();
await page
  .getByRole("status")
  .filter({ hasText: "sent successfully" })
  .waitFor();
await page.getByRole("link", { name: "Contact", exact: true }).first().click();
await page.route("https://formspree.io/**", (r) =>
  r.fulfill({ status: 500, body: "error" }),
);
await page.getByLabel("Your name").fill("Test");
await page.getByLabel("Your email").fill("test@example.com");
await page.getByLabel("Your message").fill("Intercepted test");
await page.getByRole("button", { name: "Send Message" }).click();
await page.getByRole("status").filter({ hasText: "Could not send" }).waitFor();
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://localhost:5173/simulationdashboard");
await page.getByRole("button", { name: "Toggle Driver Online" }).waitFor();
assert.equal(await page.locator(".operations").isVisible(), false);
assert.ok(
  await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
);
await page.screenshot({ path: "/tmp/trashbuddy-mobile.png", fullPage: true });
await page.goto("http://localhost:5173");
await page.waitForTimeout(1600);
assert.ok(
  await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
);
await page.screenshot({
  path: "/tmp/trashbuddy-home-mobile.png",
  fullPage: true,
});
await page.getByRole("button", { name: "Switch to dark theme" }).click();
await page.screenshot({ path: "/tmp/trashbuddy-dark.png", fullPage: true });
await page.setViewportSize({ width: 1440, height: 1000 });
await page.goto("http://localhost:5173/simulationdashboard");
await page.getByRole("button", { name: "Bring Trucks Online" }).click();
const downloadPromise = page.waitForEvent("download");
await page.getByRole("button", { name: "Export events" }).click();
const download = await downloadPromise;
assert.match(download.suggestedFilename(), /trashbuddy-sim-events/);
await page.getByRole("button", { name: "Clear events" }).click();
await page.getByText("A cleaner journey starts here.").waitFor();
await page.screenshot({
  path: "/tmp/trashbuddy-dashboard-dark.png",
  fullPage: true,
});
await page.emulateMedia({ reducedMotion: "reduce" });
await page.goto("http://localhost:5173");
await page.waitForTimeout(500);
assert.equal(
  await page
    .locator("#bin-lid")
    .evaluate((el) => getComputedStyle(el).transform),
  "none",
);
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({
  path: "/tmp/trashbuddy-home-mobile-final.png",
  fullPage: true,
});
assert.deepEqual(errors, []);
console.log(
  "Browser checks passed: routes, route completion, pause/resume, voice, location, mocked forms, mobile overflow, theme; no runtime errors.",
);
await browser.close();
