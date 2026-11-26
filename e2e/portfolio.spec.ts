import { expect, test } from "@playwright/test";

test("hydrates both languages without warnings and preserves the active stop", async ({ page }) => {
  const errors: string[] = [];
  const hydrationError = /hydrat|Minified React error #(?:418|423|425)\b/i;
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type()) && hydrationError.test(message.text())) {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    if (hydrationError.test(error.message)) errors.push(error.message);
  });

  await page.goto("/");
  await expect(page).toHaveURL(/\/es$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es-AR");
  await expect(page.getByRole("heading", { name: "Matias Arias" })).toBeVisible();
  const footer = page.getByRole("contentinfo");
  await expect(footer).toHaveText(/^Matias Arias · \d{4}$/);
  await expect(footer).toHaveCSS("position", "fixed");
  await expect(footer).toBeInViewport({ ratio: 1 });
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(
    await page.getByRole("main").evaluate((main) => Math.round(main.getBoundingClientRect().height)),
  );
  await page.getByRole("link", { name: "Experiencia", exact: true }).press("Enter");
  await expect(page).toHaveURL(/\/es#experience$/);
  await expect(page.getByRole("button", { name: "Ver experiencia" })).toBeVisible();
  await page.getByRole("link", { name: "English" }).click();
  await expect(page).toHaveURL(/\/en#experience$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("button", { name: "View experience" })).toBeVisible();
  expect(errors).toEqual([]);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("renders the chapters and preserves direct links to experience highlights", async ({ page }) => {
    await page.goto("/es#experience/0-2");
    await expect(page.getByRole("heading", { name: "Matias Arias" })).toBeVisible();
    for (const chapter of ["about", "experience", "contact"]) {
      await expect(page.locator(`#${chapter}`)).toBeVisible();
    }
    await expect(page.locator('[id="experience/0-2"]')).toBeInViewport();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    const footer = page.getByRole("contentinfo");
    await expect(footer).toHaveText(/^Matias Arias · \d{4}$/);
    await expect(footer).toHaveCSS("position", "static");
    await page.getByRole("link", { name: "Saltar al contenido" }).press("Enter");
    await expect(page.getByRole("main")).toBeFocused();
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("opens in reading mode and moves keyboard focus to the destination", async ({ page }) => {
    await page.goto("/en");
    await expect(page.getByRole("main")).toHaveAttribute("data-mode", "reading");
    await expect(page.getByRole("contentinfo")).toHaveCSS("position", "static");
    await expect(page.getByRole("button", { name: "Reading mode" })).toBeDisabled();
    const nav = page.getByRole("navigation", { name: "Chapters" });
    await nav.getByRole("link", { name: "Experience" }).press("Enter");
    await expect(page.getByRole("heading", { name: "Santander Tecnología Argentina" })).toBeFocused();
  });
});
