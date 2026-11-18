import { expect, test } from "@playwright/test";

test("redirects to English and preserves a direct chapter across languages", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { name: "Matias Arias" })).toBeVisible();
  await page.goto("/en#experience");
  await expect(page.getByText("Market & Tenders", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Español" }).click();
  await expect(page).toHaveURL(/\/es#experience$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es-AR");
  await expect(page.getByText("Mercados y Licitaciones", { exact: true })).toBeVisible();
  await expect(page.locator("audio")).toHaveJSProperty("paused", true);
});

test("renders chapters and navigation without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto("/es#about");
    await expect(page.getByRole("heading", { name: "Desarrollo productos de inversión que llegan a producción." })).toBeVisible();
    await page.getByRole("link", { name: "Contacto", exact: true }).click();
    await expect(page.getByRole("link", { name: /^GitHub/ })).toHaveAttribute("href", "https://github.com/matiarias");
    await expect(page.getByRole("link", { name: /^LinkedIn/ })).toHaveAttribute("href", "https://www.linkedin.com/in/matiasarias27");
    await expect(page.getByRole("link", { name: /^Email/ })).toHaveAttribute("href", /^mailto:/);
    await page.getByRole("link", { name: "Portada" }).click();
    await expect(page.getByRole("heading", { name: "Matias Arias" })).toBeVisible();
  } finally {
    await context.close();
  }
});

test("plays real audio after a keyboard gesture, pauses and finishes the screening", async ({ page }) => {
  await page.clock.install();
  await page.goto("/en");
  const audio = page.locator("audio");
  const play = page.getByRole("button", { name: "Play", exact: true });
  await expect(audio).toHaveJSProperty("paused", true);
  await play.focus();
  await page.keyboard.press("Enter");
  await expect.poll(() => audio.evaluate((element: HTMLAudioElement) => element.currentTime)).toBeGreaterThan(0);
  await expect(page.getByRole("heading", { name: "I build investment products for production." })).toBeFocused();
  await page.getByRole("button", { name: "Pause" }).click();
  await expect(audio).toHaveJSProperty("paused", true);
  await page.clock.fastForward(16_000);
  await expect(page.getByRole("link", { name: "About", exact: true })).toHaveAttribute("aria-current", "location");
  await page.getByRole("button", { name: "Resume" }).click();
  await page.clock.fastForward(11_000);
  await expect(page.getByRole("heading", { name: "Santander Tecnología Argentina" })).toBeVisible();
  await page.clock.fastForward(15_000);
  await expect(page.getByRole("heading", { name: "Contact", exact: true })).toBeVisible();
  await page.clock.fastForward(6_000);
  await expect(page.getByRole("button", { name: "Watch again" })).toBeVisible();
  await expect(audio).toHaveJSProperty("paused", true);
  await expect(page).toHaveURL(/\/en$/);
});

test("keeps reduced motion silent and follows browser history", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/es");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Desarrollo productos de inversión que llegan a producción." })).toBeVisible();
  await expect(page.locator("audio")).toHaveJSProperty("paused", true);
  await page.getByRole("link", { name: "Experiencia", exact: true }).click();
  await page.goBack();
  await expect(page.getByRole("link", { name: "Sobre mí", exact: true })).toHaveAttribute("aria-current", "location");
});

for (const width of [320, 390, 820, 1440]) {
  test(`keeps the experience readable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/es#experience");
    const experience = page.getByRole("region", { name: "Santander Tecnología Argentina" });
    await expect(experience.getByRole("listitem")).toHaveCount(8);
    const finalHighlight = experience.getByText("Tenencias y mercado", { exact: true });
    await finalHighlight.scrollIntoViewIfNeeded();
    await expect(finalHighlight).toBeInViewport();
    const viewport = await page.locator(".screen").evaluate((element) => ({
      width: element.clientWidth,
      scrollWidth: element.scrollWidth,
      documentWidth: document.documentElement.scrollWidth,
    }));
    expect(viewport.documentWidth).toBe(width);
    expect(viewport.scrollWidth).toBe(viewport.width);
  });
}
