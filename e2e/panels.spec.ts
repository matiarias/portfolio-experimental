import { expect, test } from "@playwright/test";

test("opens a project with the keyboard, confines focus and restores the window on Escape", async ({ page }) => {
  await page.goto("/en#experience");
  const trigger = page.getByRole("button", { name: "Market & Tenders" });
  await expect(trigger).toBeVisible();
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Market & Tenders" });
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(/#experience\/0-2$/);
  await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();
  await expect(dialog.getByText(/scalable microfrontends/)).toBeVisible();
  // WebKit may skip links during Tab navigation with its default keyboard settings.
  await page.locator('button[data-project="0-2"]').evaluate((element) => element.focus());
  await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/#experience$/);
  await expect(trigger).toBeFocused();
});

test("reopens details with history and preserves the project across locales", async ({ page }) => {
  await page.goto("/en#experience");
  await page.getByRole("button", { name: "Market & Tenders" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.goForward();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Market & Tenders" })).toBeVisible();
  await dialog.getByRole("link", { name: "Español" }).click();
  await expect(page).toHaveURL(/\/es#experience\/0-2$/);
  await expect(dialog.getByRole("heading", { name: "Mercados y Licitaciones" })).toBeVisible();
  await dialog.getByRole("button", { name: "Cerrar" }).click();
  await expect(page).toHaveURL(/\/es#experience$/);
  await expect(dialog).toBeHidden();
});

test("opens a direct project and does not open a dialog for an unknown project", async ({ page }) => {
  await page.goto("/es#experience/1-1");
  await expect(page.getByRole("dialog", { name: "Accesibilidad" })).toBeVisible();
  await page.goto("/en#experience/1-9");
  await expect(page.getByRole("button", { name: "Accessibility", exact: true })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("timeline focus lights the corresponding floor and opens its first project", async ({ page }) => {
  await page.goto("/en#experience");
  const period = page.getByRole("button", { name: /Mar 2023 – Sep 2023:/ });
  const project = page.getByRole("button", { name: "Accessibility", exact: true });
  await expect(period).toBeVisible();
  await expect(project).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await period.focus();
  await expect(period).toBeFocused();
  await expect(project).toHaveCSS("background-color", "rgba(117, 238, 255, 0.22)");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "Dólar MEP on web" })).toBeVisible();
  await expect(page).toHaveURL(/#experience\/1-0$/);
});

test("only exposes the current facade's controls and opens bio and contact", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("button", { name: "Read the bio" })).toHaveCount(0);
  await page.getByRole("link", { name: "About", exact: true }).click();
  await page.getByRole("button", { name: "Read the bio" }).click();
  const dialog = page.getByRole("dialog", { name: "Software Engineer · Frontend Specialist" });
  await expect(dialog.getByText("Fintech & Banking")).toBeVisible();
  await dialog.getByRole("button", { name: "Close" }).click();
  await expect(page).toHaveURL(/#about$/);
  await page.getByRole("link", { name: "Contact", exact: true }).click();
  await page.getByRole("button", { name: "Get in touch" }).click();
  const contact = page.getByRole("dialog", { name: "Contact" });
  const github = contact.getByRole("link", { name: /GitHub/ });
  await expect(github).toHaveAttribute("href", "https://github.com/matiarias");
  await expect(contact.getByRole("link", { name: /Email/ })).toHaveAttribute("href", /^mailto:/);
  await expect(contact.locator('.credits[data-variant="booth"]')).toBeVisible();
  await github.hover();
  await expect(github).toHaveCSS("border-top-color", "rgb(131, 237, 195)");
});

test("reveals Bio before the center and opens it without jumping the street", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator(".band-street")).toHaveAttribute("style", /transform/);
  const position = await page.evaluate(() => {
    const stage = document.querySelector<HTMLElement>("#alley-stage")!;
    const travel = stage.offsetHeight - window.innerHeight;
    const early = Math.round(travel * 0.22);
    window.scrollTo(0, early);
    return early;
  });
  const bio = page.getByRole("button", { name: "Read the bio" });
  await expect(bio).toBeVisible();
  await bio.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(await page.evaluate((expected) => Math.abs(window.scrollY - expected), position)).toBeLessThanOrEqual(2);
});

test("scrolls a long Bio inside its centered panel without moving the alley", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 600 });
  await page.goto("/es#about/details");
  const dialog = page.getByRole("dialog");
  const surface = dialog.locator(".chapter-surface");
  const body = dialog.getByRole("region");
  const close = dialog.getByRole("button", { name: "Cerrar" });
  await expect(surface).toHaveCSS("transform", "none");
  await expect(close).toBeInViewport();
  const before = await surface.boundingBox();
  const scrollY = await page.evaluate(() => window.scrollY);
  if (!before) throw new Error("The Bio panel is not visible");
  expect(before.y + before.height / 2).toBeCloseTo(300, 0);

  await body.focus();
  await page.keyboard.press("PageDown");
  await expect.poll(() => body.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  await body.hover();
  await page.mouse.wheel(0, 2_000);
  await expect.poll(() => body.evaluate((element) =>
    element.scrollHeight - element.clientHeight - element.scrollTop)).toBeLessThanOrEqual(2);
  await page.mouse.wheel(0, 500);
  await page.mouse.move(2, 300);
  await page.mouse.wheel(0, 500);
  await expect(close).toBeInViewport();
  expect(await surface.boundingBox()).toEqual(before);
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
  expect(await dialog.evaluate((element) => element.scrollTop)).toBe(0);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("keeps the contact palette in reading mode without the booth plaques", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/es#contact");
  const credits = page.locator('.credits[data-variant="reading"]');
  const github = credits.getByRole("link", { name: /GitHub/ });
  await expect(github).toHaveCSS("background-color", "rgb(17, 41, 47)");
  await github.focus();
  await expect(github).toHaveCSS("outline-color", "rgb(131, 237, 195)");
});

test.describe("mobile", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("fits eight tap targets and opens a project by touch", async ({ page }) => {
    await page.goto("/es#experience");
    const windows = page.getByRole("button").and(page.locator(".tower-window"));
    await expect(windows).toHaveCount(8);
    for (const window of await windows.all()) {
      const box = await window.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
      expect(box?.x).toBeGreaterThanOrEqual(0);
      expect((box?.x ?? 390) + (box?.width ?? 0)).toBeLessThanOrEqual(390);
    }
    await windows.first().tap();
    await expect(page.getByRole("dialog", { name: "Dólar MEP en móvil" })).toBeVisible();
  });

  test("does not expose clipped windows during approach", async ({ page }) => {
    await page.goto("/es#about");
    await page.getByRole("button", { name: "Leer la bio" }).waitFor();
    await page.evaluate(() => {
      const stage = document.querySelector<HTMLElement>("#alley-stage")!;
      window.scrollTo(0, (stage.offsetHeight - window.innerHeight) * 0.485);
    });
    const first = page.locator('[data-project="0-0"]');
    const last = page.locator('[data-project="0-4"]');
    await expect(first).toBeEnabled();
    await expect(first).toBeInViewport({ ratio: 0.99 });
    await expect(last).toBeDisabled();
    await expect(page.getByRole("button", { name: "Leer la bio" })).toHaveCount(0);
    await page.getByRole("link", { name: "Experiencia", exact: true }).tap();
    await expect(last).toBeEnabled();
  });
});

for (const fallback of ["no JavaScript", "reduced motion"] as const) {
  test(`lands on the inline project with ${fallback}`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      baseURL,
      javaScriptEnabled: fallback !== "no JavaScript",
      reducedMotion: fallback === "reduced motion" ? "reduce" : "no-preference",
    });
    try {
      const page = await context.newPage();
      await page.goto("/es#experience/0-2");
      await expect(page.locator('[id="experience/0-2"]')).toBeInViewport();
      await expect(page.getByRole("dialog")).toHaveCount(0);
    } finally {
      await context.close();
    }
  });
}
