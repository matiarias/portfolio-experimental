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
    await expect(page.getByRole("heading", { name: /Software Engineer .* Fintech & Banca/ })).toBeVisible();
    await page.getByRole("link", { name: "Contacto", exact: true }).click();
    await expect(page.getByRole("heading", {
      name: "Estoy abierto a oportunidades remotas como Software Engineer.",
      exact: true,
    })).toBeVisible();
    await expect.poll(() => page.locator(".projection-spill").evaluate(
      (element) => getComputedStyle(element, "::after").opacity,
    )).toBe("0.35");
    await expect(page.getByRole("link", { name: /^GitHub/ })).toHaveAttribute("href", "https://github.com/matiarias");
    await expect(page.getByRole("link", { name: /^LinkedIn/ })).toHaveAttribute("href", "https://www.linkedin.com/in/matiasarias27");
    await expect(page.getByRole("link", { name: /^Email/ })).toHaveAttribute("href", /^mailto:/);
    await page.getByRole("link", { name: "Portada" }).click();
    await expect(page.getByRole("heading", { name: "Matias Arias" })).toBeVisible();
    await page.getByRole("link", { name: "Ver experiencia" }).click();
    await expect(page.getByRole("region", { name: "Santander Tecnología Argentina" })).toBeVisible();
  } finally {
    await context.close();
  }
});

test("plays real audio after a keyboard gesture, pauses and finishes the screening", async ({ page }) => {
  await page.clock.install();
  await page.goto("/en");
  const audio = page.locator("audio");
  const play = page.getByRole("button", { name: "Play", exact: true });
  const projection = page.locator(".preview");
  await expect(audio).toHaveJSProperty("paused", true);
  await play.focus();
  await page.keyboard.press("Enter");
  await expect(projection).toHaveAttribute("data-projection", "lit");
  await expect.poll(() => audio.evaluate((element: HTMLAudioElement) => element.currentTime)).toBeGreaterThan(0);
  await expect(page.getByRole("heading", { name: /Software Engineer .* Fintech & Banking/ })).toBeFocused();
  await page.getByRole("button", { name: "Pause" }).click();
  await expect(audio).toHaveJSProperty("paused", true);
  await expect(projection).toHaveAttribute("data-projection", "lit");
  await page.clock.fastForward(16_000);
  await expect(page.getByRole("link", { name: "About", exact: true })).toHaveAttribute("aria-current", "location");
  await page.getByRole("button", { name: "Resume" }).click();
  await page.clock.fastForward(11_000);
  await expect(page.getByRole("heading", { name: "Santander Tecnología Argentina" })).toBeVisible();
  await page.clock.fastForward(15_000);
  await expect(page.getByRole("heading", {
    name: "I’m open to remote Software Engineer roles.",
    exact: true,
  })).toBeVisible();
  await expect(projection).not.toHaveAttribute("data-projection", "lit");
  await page.clock.fastForward(6_000);
  await expect(page.getByRole("button", { name: "Watch again" })).toBeVisible();
  await expect(audio).toHaveJSProperty("paused", true);
  await expect(page).toHaveURL(/\/en$/);
});

test("lights each part of the city on the cover and in chapters", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/es");
  const title = page.getByRole("heading", { name: "Matias Arias" });
  const navigation = page.getByRole("navigation", { name: "Capítulos" });
  const cover = navigation.getByRole("link", { name: "Portada" });
  await expect(cover).toHaveAttribute("aria-current", "location");

  for (const zone of ["tower", "lantern", "bridge", "river"]) {
    const light = page.locator(`[data-scene-light="${zone}"]`);
    await page.locator(`[data-scene-zone="${zone}"]`).hover();
    await expect(light).toHaveCSS("opacity", "0.9");
    await title.hover();
    await expect(light).toHaveCSS("opacity", "0");
  }

  const reed = page.locator("[data-scene-reeds] > span").first();
  const drop = page.locator("[data-scene-dew] > span").first();
  await expect(reed).toHaveCSS("rotate", "-27deg");
  await expect(drop).toHaveCSS("animation-name", "none");
  await page.locator('[data-scene-zone="reeds"]').hover();
  await expect(reed).toHaveCSS("rotate", "-14deg");
  await expect(drop).not.toHaveCSS("animation-name", "none");
  await title.hover();
  await expect(reed).toHaveCSS("rotate", "-27deg");

  for (const chapter of ["Sobre mí", "Experiencia", "Contacto"]) {
    await navigation.getByRole("link", { name: chapter, exact: true }).click();
    await expect(cover).toBeVisible();
    await expect(cover).not.toHaveAttribute("aria-current", "location");
    const bridge = page.locator('[data-scene-light="bridge"]');
    await bridge.locator("..").hover();
    await expect(bridge).toHaveCSS("opacity", "0.9");
  }

  const lantern = page.locator('[data-scene-light="lantern"]');
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(drop).toHaveCSS("animation-name", "none");
  const area = await lantern.locator("..").boundingBox();
  if (!area) throw new Error("Lantern zone is missing");
  await page.mouse.move(area.x + area.width / 2, area.y + area.height / 2);
  await expect(lantern).toHaveCSS("opacity", "0");
  await cover.click();
  await expect(title).toBeVisible();
  await expect(cover).toHaveAttribute("aria-current", "location");
});

test("shows the tower, bridge and reeds above the projection on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/es");
  await expect(page.locator(".cover-role")).toHaveText("Software Engineer");
  const widths = await page.evaluate(() => {
    const scene = document.querySelector<HTMLElement>(".scene")!;
    const backdrop = document.querySelector<HTMLElement>(".backdrop")!;
    scene.scrollLeft = 100;
    backdrop.scrollLeft = 100;
    window.scrollTo(100, 0);
    return {
      page: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
      horizontalScroll: window.scrollX + scene.scrollLeft + backdrop.scrollLeft,
    };
  });
  expect(widths.page).toBe(widths.viewport);
  expect(widths.horizontalScroll).toBe(0);
  const screen = await page.locator(".projection-frame").boundingBox();
  if (!screen) throw new Error("Projection frame is missing");

  for (const part of ["tower", "bridge", "reeds"]) {
    const bounds = await page.locator(`[data-scene-zone="${part}"]`).boundingBox();
    if (!bounds) throw new Error(`Missing city zone ${part}`);
    expect(bounds.y + bounds.height / 2).toBeLessThan(screen.y);
    expect(bounds.x + bounds.width / 2).toBeGreaterThan(0);
    expect(bounds.x + bounds.width / 2).toBeLessThan(390);
  }
});

test("keeps reduced motion silent and follows browser history", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/es");
  await page.getByRole("button", { name: "Play", exact: true }).press("Enter");
  await expect(page.getByRole("heading", { name: /Software Engineer .* Fintech & Banca/ })).toBeVisible();
  await expect(page.locator("audio")).toHaveJSProperty("paused", true);
  await page.getByRole("link", { name: "Experiencia", exact: true }).press("Enter");
  await page.goBack();
  await expect(page.getByRole("link", { name: "Sobre mí", exact: true })).toHaveAttribute("aria-current", "location");
});

test("highlights the role and achievement titles in both experience periods on hover", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/es#experience");
  const experience = page.getByRole("region", { name: "Santander Tecnología Argentina" });
  const titles = experience.locator(".role-heading h3, li > strong");
  await expect(titles).toHaveCount(10);
  const accent = await experience.locator(".eyebrow").evaluate((element) => getComputedStyle(element).color);
  for (const title of await titles.all()) {
    await expect(title).not.toHaveCSS("color", accent);
    await title.hover();
    await expect(title).toHaveCSS("color", accent);
  }
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
