import { expect, test } from "@playwright/test";

test("opens the complete experience with the keyboard and restores focus on Escape", async ({ page }) => {
  await page.goto("/en#experience");
  const trigger = page.getByRole("button", { name: "View experience" });
  await expect(trigger).toBeVisible();
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Experience" });
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(/#experience\/details$/);
  await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();
  await expect(dialog.locator(".role-heading p")).toHaveText(["Sep 2023 – Jun 2026", "Mar 2023 – Sep 2023"]);
  await expect(dialog.getByRole("listitem")).toHaveCount(8);
  // WebKit may skip links during Tab navigation with its default keyboard settings.
  await trigger.evaluate((element) => element.focus());
  await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/#experience$/);
  await expect(trigger).toBeFocused();
});

test("reopens experience with history and preserves the details link across locales", async ({ page }) => {
  await page.goto("/en#experience");
  await page.getByRole("button", { name: "View experience" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.goForward();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Experience", exact: true })).toBeVisible();
  await dialog.getByRole("link", { name: "Español" }).click();
  await expect(page).toHaveURL(/\/es#experience\/details$/);
  await expect(dialog.getByRole("heading", { name: "Experiencia", exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "Cerrar" }).click();
  await expect(page).toHaveURL(/\/es#experience$/);
  await expect(dialog).toBeHidden();
});

test("legacy experience links land on their highlight across locales", async ({ page }) => {
  await page.goto("/en#experience/1-1");
  const dialog = page.getByRole("dialog");
  const highlight = dialog.locator('[data-panel-anchor="experience/1-1"]');
  await expect(highlight).toBeFocused();
  await expect(highlight).toBeInViewport();
  await dialog.getByRole("link", { name: "Español" }).click();
  await expect(page).toHaveURL(/\/es#experience\/1-1$/);
  await expect(highlight).toContainText("Accesibilidad");
  await expect(highlight).toBeFocused();
  await expect(highlight).toBeInViewport();
});

test("unknown experience links do not open a dialog", async ({ page }) => {
  await page.goto("/en#experience/1-9");
  await expect(page.getByRole("button", { name: "View experience" })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("only exposes the current facade's controls and opens Bio", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("button", { name: "Read the bio" })).toHaveCount(0);
  await page.getByRole("link", { name: "About", exact: true }).click();
  await page.getByRole("button", { name: "Read the bio" }).click();
  const dialog = page.getByRole("dialog", { name: "Software Engineer · Frontend Specialist" });
  await expect(dialog.getByText("Fintech & Banking")).toBeVisible();
  await dialog.getByRole("button", { name: "Close" }).press("Enter");
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/#about$/);
});

test("opens Contact from its facade and shows its links", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("button", { name: "Get in touch" })).toHaveCount(0);
  await page.getByRole("link", { name: "Contact", exact: true }).click();
  await page.getByRole("button", { name: "Get in touch" }).click();
  const contact = page.getByRole("dialog", { name: "Contact" });
  const github = contact.getByRole("link", { name: /GitHub/ });
  await expect(github).toHaveAttribute("href", "https://github.com/matiarias");
  await expect(contact.getByRole("link", { name: /Email/ })).toHaveAttribute("href", /^mailto:/);
  await expect(contact.locator('.credits[data-variant="booth"]')).toBeVisible();
});

test("lights the Contact links on hover after the dialog settles", async ({ page }) => {
  await page.goto("/en#contact/details");
  const contact = page.getByRole("dialog", { name: "Contact" });
  await expect(contact.locator(".chapter-surface")).toHaveCSS("transform", "none");
  const github = contact.getByRole("link", { name: /GitHub/ });
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

  test("opens the single-column experience by touch", async ({ page }) => {
    await page.goto("/es#experience");
    const trigger = page.getByRole("button", { name: "Ver experiencia" });
    await expect(trigger).toBeInViewport({ ratio: 0.99 });
    await trigger.tap();
    const dialog = page.getByRole("dialog", { name: "Experiencia" });
    await expect(dialog.locator(".chapter-surface")).toHaveCSS("transform", "none");
    const roles = dialog.locator(".experience-role");
    const first = await roles.first().boundingBox();
    const last = await roles.last().boundingBox();
    if (!first || !last) throw new Error("Both experience periods should have a layout");
    expect(last.y).toBeGreaterThan(first.y);
    expect(last.x).toBeCloseTo(first.x, 0);
    await expect(dialog.getByRole("button", { name: "Cerrar" })).toBeInViewport();
  });

  test("does not expose the tower button before it is fully visible", async ({ page }) => {
    await page.goto("/es#about");
    await page.getByRole("button", { name: "Leer la bio" }).waitFor();
    await page.evaluate(() => {
      const stage = document.querySelector<HTMLElement>("#alley-stage")!;
      window.scrollTo(0, (stage.offsetHeight - window.innerHeight) * 0.49);
    });
    await expect(page.locator("#alley-stage")).toHaveAttribute("data-lit-facade", "experience");
    const trigger = page.getByRole("button", { name: "Ver experiencia" });
    await expect(trigger).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Leer la bio" })).toHaveCount(0);
    await page.getByRole("link", { name: "Experiencia", exact: true }).tap();
    await expect(trigger).toBeEnabled();
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
