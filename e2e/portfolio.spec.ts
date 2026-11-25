import { expect, test } from "@playwright/test";

test("redirects the root to English", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { name: "Matias Arias" })).toBeVisible();
});

test("preserves the stop across languages", async ({ page }) => {
  await page.goto("/en#experience");
  await expect(page.locator("main")).toHaveAttribute("data-active-stop", "experience");

  await page.getByRole("link", { name: "Español" }).click();
  await expect(page).toHaveURL(/\/es#experience$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es-AR");
  await expect(page.locator("main")).toHaveAttribute("data-active-stop", "experience");
});

test("renders the portfolio without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto("/en");
    await expect(page.getByRole("heading", { name: "Matias Arias" })).toBeVisible();
    await expect(page.locator("#about")).toBeVisible();
    await expect(page.locator("#experience")).toBeVisible();
    await expect(page.locator("#contact")).toBeVisible();
    await expect(page.getByText("Fintech & Banking", { exact: true })).toBeVisible();
  } finally {
    await context.close();
  }
});

test("switches between the alley and reading mode", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator("main")).toHaveAttribute("data-mode", "scene");

  await page.getByRole("button", { name: "Reading mode" }).click();
  await expect(page.locator("main")).toHaveAttribute("data-mode", "reading");
  await expect(page.locator("#about")).toBeVisible();

  await page.getByRole("button", { name: "Reading mode" }).click();
  await expect(page.locator("main")).toHaveAttribute("data-mode", "scene");
  await expect(page.locator("#alley-stage")).toBeVisible();
});

test("walks the alley as the page scrolls", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator("main")).toHaveAttribute("data-active-stop", "entrance");

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(page.locator("main")).toHaveAttribute("data-active-stop", "contact", {
    timeout: 10_000,
  });
});

test("brightens the neon at the facade edge and dims it again in the gap", async ({ page }) => {
  await page.goto("/en");
  const stage = page.locator("#alley-stage");
  await expect(page.locator(".band-street")).toHaveAttribute("style", /transform/);
  const sign = stage.locator('[data-stop="about"] .storefront-sign-plate');
  const halo = () => sign.evaluate((element) => Number(getComputedStyle(element, "::before").opacity));

  await stage.evaluate((element) => window.scrollTo(0, (element.getBoundingClientRect().height - window.innerHeight) * 0.22));
  await expect(stage).toHaveAttribute("data-lit-facade", "about");
  await expect.poll(halo).toBeGreaterThan(0.9);

  // Midway between the centers of About and Experience is the physical gap.
  await stage.evaluate((element) => window.scrollTo(0, (element.getBoundingClientRect().height - window.innerHeight) * 0.48));
  await expect(stage).not.toHaveAttribute("data-lit-facade");
  await expect.poll(halo).toBeLessThan(0.5);
});

test("navigates stops with the keyboard", async ({ page }) => {
  await page.goto("/en");
  const experience = page.getByRole("link", { name: "Experience", exact: true });
  await experience.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#experience$/);
  await expect(page.locator("main")).toHaveAttribute("data-active-stop", "experience");
});

test("returns to the entrance through Home or Inicio without a duplicate brand link", async ({ page }) => {
  for (const [locale, label] of [["en", "Home"], ["es", "Inicio"]]) {
    await page.goto(`/${locale}#contact`);
    const nav = page.locator(".hud-nav");
    const home = nav.getByRole("link").first();
    await expect(home).toHaveAccessibleName(label);
    await expect(page.locator(".alley-hud")).not.toContainText("Matias Arias");

    await home.focus();
    await home.press("Enter");
    await expect(page).toHaveURL(new RegExp(`/${locale}$`));
    await expect(home).toHaveAttribute("aria-current", "location");
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  }
});

test("lands on a deep link without walking", async ({ page }) => {
  await page.goto("/es#about");
  await expect(page.locator("main")).toHaveAttribute("data-active-stop", "about");
  await expect(page.locator("main")).toHaveAttribute("data-mode", "scene");
});

test("renders four independent SVG facades and one experience control", async ({ page }) => {
  await page.goto("/es#experience");
  await expect(page.locator("main")).toHaveAttribute("data-active-stop", "experience");
  await expect(page.locator(".storefront-art")).toHaveCount(4);
  await expect(page.locator('.neon-sign[lang="ja"][aria-hidden="true"] svg path')).toHaveCount(4);
  await expect(page.locator('.storefront[data-stop="experience"] [data-window]')).toHaveCount(8);
  const tower = page.locator('.storefront[data-stop="experience"]');
  await expect(tower.getByRole("button")).toHaveCount(1);
  await expect(tower.getByRole("button", { name: "Ver experiencia" })).toBeEnabled();
  const svgBytes = await page.locator(".storefront svg").evaluateAll((nodes) =>
    nodes.reduce((bytes, node) => bytes + new TextEncoder().encode(node.outerHTML).length, 0),
  );
  expect(svgBytes).toBeLessThanOrEqual(120_000);
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("opens in reading mode without animation", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("main")).toHaveAttribute("data-mode", "reading");
    await expect(page.locator("#about")).toBeVisible();
    await expect(page.getByRole("button", { name: "Reading mode" })).toBeDisabled();
  });
});

test.describe("mobile", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("keeps the alley usable with touch", async ({ page }) => {
    await page.goto("/en");
    const nav = page.getByRole("navigation", { name: "Chapters" });
    await expect(nav).toBeVisible();

    const contact = nav.getByRole("link", { name: "Contact", exact: true });
    const { offsetWidth, offsetHeight } = await contact.evaluate((element: HTMLAnchorElement) => ({
      offsetWidth: element.offsetWidth,
      offsetHeight: element.offsetHeight,
    }));
    expect(offsetWidth).toBeGreaterThanOrEqual(44);
    expect(offsetHeight).toBeGreaterThanOrEqual(44);

    await contact.tap();
    await expect(page.locator("main")).toHaveAttribute("data-active-stop", "contact");
  });

  test("fits all Spanish navigation links at 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 750 });
    await page.goto("/es");
    const nav = page.getByRole("navigation", { name: "Capítulos" });
    await expect(nav.getByRole("link")).toHaveCount(4);
    expect(await nav.evaluate((element) => element.scrollWidth)).toBeLessThanOrEqual(
      await nav.evaluate((element) => element.clientWidth),
    );
  });
});
