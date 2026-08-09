import { chromium } from "playwright";

const url = "http://localhost:8080/__test-upscaler";
const imagePath = "/tmp/test-upscale-sample.png";

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage();

const consoleMsgs = [];
page.on("console", (msg) => consoleMsgs.push(`[${msg.type()}] ${msg.text()}`));
page.on("pageerror", (err) => consoleMsgs.push("pageerror: " + err.message));

const requests = [];
page.on("request", (req) => requests.push(req.url()));
page.on("requestfailed", (req) => consoleMsgs.push("requestfailed: " + req.url() + " " + req.failure()?.errorText));

console.log("Navigating...");
await page.goto(url, { waitUntil: "domcontentloaded" });
await page.waitForSelector("text=AI Image Upscaler", { timeout: 15000 });
console.log("Page loaded.");

const fileInput = await page.locator('input[type="file"]');
await fileInput.setInputFiles(imagePath);
await page.waitForSelector("text=Image uploaded", { timeout: 10000 });
console.log("Image uploaded.");

await page.click('button:has-text("Upscale to 4K")');
console.log("Clicked upscale.");

// Poll for up to 120s, logging button text (progress %) every 5s
let done = false;
for (let i = 0; i < 24; i++) {
  await page.waitForTimeout(5000);
  const btnText = await page.locator("button", { hasText: /Upscaling|Upscale/ }).first().innerText().catch(() => "?");
  console.log(`[t=${(i + 1) * 5}s] button: "${btnText}"`);
  const hasResult = await page.locator("text=Before & After Comparison").count();
  if (hasResult > 0) { done = true; console.log("Result appeared!"); break; }
  const toastError = await page.locator('[role="status"], [role="alert"]').allInnerTexts().catch(() => []);
  if (toastError.length) console.log("Toast/status text:", toastError);
}

await page.screenshot({ path: "/tmp/upscaler-2-result.png" });

const upscalerFnCalls = requests.filter((r) => r.includes("functions/v1/image-upscaler"));
console.log("Calls to old edge function:", upscalerFnCalls.length, upscalerFnCalls);

console.log("--- Console/page messages ---");
for (const m of consoleMsgs) console.log(m);

console.log(done ? "RESULT: SUCCESS" : "RESULT: TIMED OUT");
await browser.close();
