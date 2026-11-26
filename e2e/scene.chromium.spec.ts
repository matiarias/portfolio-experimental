import { expect, test } from "@playwright/test";

test("scrolls the alley to Contact and opens its contact links", async ({ page }) => {
  await page.goto("/es");
  await expect(page.locator(".band-street")).toHaveAttribute("style", /transform/);
  const stage = page.locator("#alley-stage");
  await stage.evaluate((element) => window.scrollTo(0, (element.getBoundingClientRect().height - window.innerHeight) * 0.22));
  await expect(stage).toHaveAttribute("data-lit-facade", "about");
  const about = page.getByRole("link", { name: "Sobre mí", exact: true });
  await expect(about).toHaveAttribute("aria-current", "location");
  await stage.evaluate((element) => window.scrollTo(0, (element.getBoundingClientRect().height - window.innerHeight) * 0.48));
  await expect(stage).not.toHaveAttribute("data-lit-facade");
  await expect(page).toHaveURL(/#experience$/);
  await expect(about).toHaveAttribute("aria-current", "location");
  await page.keyboard.press("End");
  await expect(page.getByRole("main")).toHaveAttribute("data-active-stop", "contact");
  await page.getByRole("button", { name: "Contactarme" }).click();
  const dialog = page.getByRole("dialog", { name: "Contacto" });
  await expect(dialog.getByRole("link", { name: /GitHub/ })).toHaveAttribute("href", "https://github.com/matiarias");
  await expect(dialog.getByRole("link", { name: /Email/ })).toHaveAttribute("href", /^mailto:/);
});
