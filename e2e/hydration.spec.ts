import { expect, test, type Page } from "@playwright/test";

const hydrationMessage = /hydrat|Minified React error #(?:418|423|425)\b/i;

function collectHydrationErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type()) && hydrationMessage.test(message.text())) {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    if (hydrationMessage.test(error.message)) errors.push(error.message);
  });
  return errors;
}

test("hydrates both locales and a direct stop without warnings", async ({ page }) => {
  const errors = collectHydrationErrors(page);
  await page.goto("/es");
  await expect(page.locator("html")).toHaveAttribute("lang", "es-AR");
  await expect(page.getByRole("heading", { name: "Matias Arias" })).toBeVisible();

  await page.goto("/en#experience");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("main")).toHaveAttribute("data-active-stop", "experience");
  expect(errors).toEqual([]);
});

test("tolerates classes injected into the document root before hydration", async ({ page }) => {
  const errors = collectHydrationErrors(page);
  await page.addInitScript(() => {
    const injectClasses = () => document.documentElement.classList.add("addrdx", "idc0_350");
    if (document.documentElement) {
      injectClasses();
      return;
    }
    const observer = new MutationObserver(() => {
      if (!document.documentElement) return;
      injectClasses();
      observer.disconnect();
    });
    observer.observe(document, { childList: true });
  });

  await page.goto("/es");
  await expect(page.locator("html")).toHaveClass(/\baddrdx idc0_350\b/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es-AR");

  const about = page.getByRole("link", { name: "Sobre mí", exact: true });
  await about.click();
  await expect(page.locator("main")).toHaveAttribute("data-active-stop", "about");
  expect(errors).toEqual([]);
});
