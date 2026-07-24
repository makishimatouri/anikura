import assert from "node:assert/strict";

const playwrightEntry = process.env.PLAYWRIGHT_ENTRY;
if (!playwrightEntry) throw new Error("PLAYWRIGHT_ENTRY is required");
const { chromium } = await import(playwrightEntry);
const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});

for (const viewport of [{ name: "desktop", width: 1440, height: 1000 }, { name: "mobile", width: 390, height: 844 }]) {
  const page = await browser.newPage({ viewport });
  await page.goto("http://127.0.0.1:3100/admin/preview", { waitUntil: "networkidle" });
  assert.equal(await page.locator("h1").textContent(), "活动工作区");
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  assert.ok(dimensions.scrollWidth <= dimensions.clientWidth, `${viewport.name} has horizontal overflow`);
  const navigation = page.getByRole("navigation", { name: "后台主导航" });
  assert.ok(await navigation.isVisible(), `${viewport.name} navigation is hidden`);
  const reviewButton = page.getByRole("button", { name: "审核并发布" });
  assert.ok(await reviewButton.isVisible(), `${viewport.name} review command is hidden`);
  const reviewButtonSize = await reviewButton.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  });
  assert.ok(reviewButtonSize.height >= 44, `${viewport.name} review command touch target is too short`);
  await page.screenshot({ path: `/private/tmp/anikura-admin-${viewport.name}.png`, fullPage: true });
  await page.close();
}

const reducedPage = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
await reducedPage.goto("http://127.0.0.1:3100/admin/preview", { waitUntil: "networkidle" });
const animated = await reducedPage.evaluate(() =>
  [...document.querySelectorAll("*")].filter((element) => {
    const style = getComputedStyle(element);
    return style.animationName !== "none" && style.animationDuration !== "0s";
  }).map((element) => ({ tag: element.tagName, animation: getComputedStyle(element).animationName }))
);
assert.deepEqual(animated, []);
await browser.close();
console.log("Admin visual QA passed: desktop, 390px, and prefers-reduced-motion.");
