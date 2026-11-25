import { expect, test } from "@playwright/test";
import { soundtrack } from "../src/content/soundtrack";

if (!soundtrack) throw new Error("The soundtrack tests require a configured track");
const { src: soundtrackPath } = soundtrack;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const events: unknown[] = [];
    Object.defineProperty(window, "__soundtrackEvents", { value: events });
    const record = (event: Event) => {
      const audio = event.target instanceof HTMLAudioElement
        ? event.target
        : document.querySelector("audio");
      if (audio) events.push({
        event: event.type, hidden: document.hidden, paused: audio.paused,
        time: audio.currentTime, readyState: audio.readyState,
        error: audio.error && { code: audio.error.code, message: audio.error.message },
      });
    };
    for (const event of ["play", "playing", "pause", "error", "emptied", "waiting", "visibilitychange", "pagehide"]) {
      window.addEventListener(event, record, true);
    }
  });
});

test.afterEach(async ({ page }, info) => {
  if (info.status === info.expectedStatus || page.isClosed()) return;
  const events = await page.evaluate(() => Reflect.get(window, "__soundtrackEvents")).catch(() => undefined);
  if (events) await info.attach("native-audio-events", { body: JSON.stringify(events, null, 2), contentType: "application/json" });
});

test("loads the MP3 on a keyboard gesture and pauses without automatically resuming", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === soundtrackPath) requests.push(request.url());
  });

  await page.goto("/en");
  const audio = page.locator(".hud-soundtrack audio");
  const play = page.getByRole("button", { name: "Play background music" });
  const pause = page.getByRole("button", { name: "Pause background music" });
  await expect(audio).not.toHaveAttribute("src");
  await expect(audio).toHaveJSProperty("paused", true);
  expect(requests).toHaveLength(0);

  await play.press("Enter");
  await expect(pause).toBeFocused();
  await expect.poll(() => audio.evaluate((element: HTMLAudioElement) => element.currentTime)).toBeGreaterThan(0);
  // The component test covers the title; here we verify native playback.
  // WebKit's native media pipeline may not emit a Playwright request event.
  await expect(audio).toHaveAttribute("src", soundtrackPath);

  await expect(pause, "Playback should still expose Pause after the media clock advances").toBeFocused();
  await pause.press("Enter");
  await expect(audio).toHaveJSProperty("paused", true);
  await expect(play).toBeFocused();
  const pausedAt = await audio.evaluate((element: HTMLAudioElement) => element.currentTime);
  await play.press("Enter");
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
    const pause = page.getByRole("button", { name: "Pausar música de fondo" });
    const size = await play.boundingBox();
    expect(size?.width).toBeGreaterThanOrEqual(44);
    expect(size?.height).toBeGreaterThanOrEqual(44);
    const reading = page.getByRole("button", { name: "Modo lectura" });
    await play.tap();
    await expect.poll(() => audio.evaluate((element: HTMLAudioElement) => element.currentTime)).toBeGreaterThan(0);
    await expect(pause, "Playback should still expose Pause after the media clock advances").toBeVisible();
    const title = page.locator(".hud-soundtrack-title");
    await expect(title).toHaveCount(1);
    await expect(title).toBeHidden();
    await pause.tap();
    await expect(audio).toHaveJSProperty("paused", true);
    const pausedAt = await audio.evaluate((element: HTMLAudioElement) => element.currentTime);
    await play.tap();
    await expect.poll(() => audio.evaluate((element: HTMLAudioElement) => element.currentTime)).toBeGreaterThan(pausedAt);

    await reading.tap();
    await expect(audio).toHaveCount(0);
    await reading.tap();
    await expect(play).toBeVisible();
    await expect(audio).not.toHaveAttribute("src");
    await expect(audio).toHaveJSProperty("paused", true);
  });
});
