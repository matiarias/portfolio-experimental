import { expect, test } from "@playwright/test";

test("opens Experience with the keyboard and restores focus on Escape", async ({ page }) => {
  await page.goto("/en#experience");
  const trigger = page.getByRole("button", { name: "View experience" });
  await trigger.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Experience" });
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(/#experience\/details$/);
  await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/#experience$/);
  await expect(trigger).toBeFocused();
});

test("preserves the experience highlight in the localized deep link", async ({ page }) => {
  await page.goto("/en#experience/1-1");
  const dialog = page.getByRole("dialog");
  const highlight = dialog.locator('[data-panel-anchor="experience/1-1"]');
  await expect(highlight).toBeFocused();
  const spanish = dialog.getByRole("link", { name: "Español" });
  await expect(spanish).toHaveAttribute("href", "/es#experience/1-1");
  await page.goto("/es#experience/1-1");
  await expect(page).toHaveURL(/\/es#experience\/1-1$/);
  await expect(highlight).toBeFocused();
  await expect(highlight).toBeInViewport();
});

test.describe("mobile", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("navigates to the Experience facade and opens it by touch", async ({ page }) => {
    await page.goto("/es");
    const nav = page.getByRole("navigation", { name: "Capítulos" });
    const footer = page.getByRole("contentinfo");
    await expect(footer).toBeInViewport({ ratio: 1 });
    const signature = await footer.boundingBox();
    const hint = await page.locator(".scroll-hint").boundingBox();
    if (!signature || !hint) throw new Error("Expected the signature and scroll hint at the entrance");
    expect(hint.y + hint.height).toBeLessThan(signature.y);
    await nav.getByRole("link", { name: "Experiencia", exact: true }).tap();
    const trigger = page.getByRole("button", { name: "Ver experiencia" });
    await expect(trigger).toBeInViewport({ ratio: 0.99 });
    await trigger.tap();
    const dialog = page.getByRole("dialog", { name: "Experiencia" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Cerrar" })).toBeInViewport();
    await dialog.getByRole("button", { name: "Cerrar" }).press("Enter");
    await expect(dialog).toBeHidden();
    await nav.getByRole("link", { name: "Contacto", exact: true }).tap();
    await expect(footer).toBeInViewport();
  });
});
