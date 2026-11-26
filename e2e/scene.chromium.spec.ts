import { expect, test } from "@playwright/test";

test("scrolls the alley to Contact and opens its contact links", async ({ page }) => {
  await page.goto("/es");
  await expect(page.locator(".band-street")).toHaveAttribute("style", /transform/);
  await page.keyboard.press("End");
  await expect(page.getByRole("main")).toHaveAttribute("data-active-stop", "contact");
  await page.getByRole("button", { name: "Contactarme" }).click();
  const dialog = page.getByRole("dialog", { name: "Contacto" });
  await expect(dialog.getByRole("link", { name: /GitHub/ })).toHaveAttribute("href", "https://github.com/matiarias");
  await expect(dialog.getByRole("link", { name: /Email/ })).toHaveAttribute("href", /^mailto:/);
});
