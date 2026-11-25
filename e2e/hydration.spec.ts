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

for (const width of [390, 1280, 1366]) {
  test(`leaves a safe left margin on the entrance sign through hydration at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    let allowScripts!: () => void;
    const gate = new Promise<void>((resolve) => { allowScripts = resolve; });
    await page.route("**/_next/static/**/*.js", async (route) => {
      await gate;
      await route.continue();
    });

    const plate = page.locator('[data-stop="entrance"] .storefront-sign-plate');
    let before;
    try {
      await page.goto("/es", { waitUntil: "commit" });
      await expect(plate).toBeVisible();
      await expect(page.locator(".band-street")).not.toHaveAttribute("style", /transform/);
      before = await plate.boundingBox();
    } finally {
      allowScripts();
    }

    await page.waitForLoadState("load");
    await expect(page.locator(".band-street")).toHaveAttribute("style", /transform/, { timeout: 10_000 });
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    const after = await plate.boundingBox();
    expect(before?.x).toBeGreaterThanOrEqual(20);
    expect(after?.x).toBeCloseTo(before?.x ?? -1, 1);
    const text = plate.locator(".storefront-label, .storefront-role");
    await expect(text).toHaveCount(2);
    for (const box of await text.evaluateAll((nodes) => nodes.map((node) => {
      const range = document.createRange();
      range.selectNodeContents(node);
      const { left, right, top, bottom } = range.getBoundingClientRect();
      return { left, right, top, bottom };
    }))) {
      expect(box.left).toBeGreaterThanOrEqual(20);
      expect(box.right).toBeLessThanOrEqual(width - 20);
      expect(box.top).toBeGreaterThan(0);
      expect(box.bottom).toBeLessThan(800);
    }
  });
}

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
