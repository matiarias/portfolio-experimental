import { expect, test } from "@playwright/test";

test("loads the MP3 on a keyboard gesture and pauses without automatically resuming", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/media/gentle-pathways.mp3") requests.push(request.url());
  });

  await page.goto("/en");
  await expect(page.locator(".band-street")).toHaveAttribute("style", /transform/);
  const audio = page.locator(".hud-soundtrack audio");
  const play = page.getByRole("button", { name: "Play background music" });
  const pause = page.getByRole("button", { name: "Pause background music" });
  await expect(audio).not.toHaveAttribute("src");
  await expect(audio).toHaveJSProperty("paused", true);
  expect(requests).toHaveLength(0);

  await play.focus();
  await page.keyboard.press("Enter");
  await expect(pause).toBeFocused();
  await expect.poll(() => audio.evaluate((element: HTMLAudioElement) => element.currentTime)).toBeGreaterThan(0);
  await expect(page.getByText("Gentle Pathways", { exact: true })).toBeVisible();
  // WebKit's native media pipeline may not emit a Playwright request event.
  await expect(audio).toHaveAttribute("src", "/media/gentle-pathways.mp3");

  await page.keyboard.press("Enter");
  await expect(audio).toHaveJSProperty("paused", true);
  await expect(play).toBeFocused();
  const pausedAt = await audio.evaluate((element: HTMLAudioElement) => element.currentTime);
  await page.keyboard.press("Enter");
  await expect.poll(() => audio.evaluate((element: HTMLAudioElement) => element.currentTime)).toBeGreaterThan(pausedAt);

  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(audio).toHaveJSProperty("paused", true);
  await page.evaluate(() => {
    Reflect.deleteProperty(document, "hidden");
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(play).toBeVisible();
  await expect(audio).toHaveJSProperty("paused", true);
});

test.describe("soundtrack on touch", () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

  test("plays by touch, keeps the title out of the HUD and stops in reading mode", async ({ page }) => {
    await page.goto("/es");
    const audio = page.locator(".hud-soundtrack audio");
    const play = page.getByRole("button", { name: "Reproducir música de fondo" });
    const size = await play.boundingBox();
    expect(size?.width).toBeGreaterThanOrEqual(44);
    expect(size?.height).toBeGreaterThanOrEqual(44);
    const reading = page.getByRole("button", { name: "Modo lectura" });
    await play.tap();
    await expect.poll(() => audio.evaluate((element: HTMLAudioElement) => element.currentTime)).toBeGreaterThan(0);
    await expect(page.getByText("Gentle Pathways", { exact: true })).toBeHidden();

    await reading.tap();
    await expect(audio).toHaveCount(0);
    await reading.tap();
    await expect(play).toBeVisible();
    await expect(audio).not.toHaveAttribute("src");
    await expect(audio).toHaveJSProperty("paused", true);
  });
});
