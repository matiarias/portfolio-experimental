import { expect, test } from "@playwright/test";

test("pauses the scene in a hidden tab and catches up without walking on return", async ({ page }) => {
  await page.goto("/en");
  const stage = page.locator("#alley-stage");
  const street = stage.locator(".band-street");
  const rain = stage.locator(".alley-rain");
  await expect(street).toHaveAttribute("style", /transform/);
  await expect(rain).toHaveCSS("animation-play-state", "running");
  const before = await street.evaluate((element) => getComputedStyle(element).transform);

  // Drive the Page Visibility event consistently in all three headless engines.
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
  await expect(rain).toHaveCSS("animation-play-state", "paused");
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await expect(street).toHaveCSS("transform", before);
  await expect(page).not.toHaveURL(/#contact$/);

  await page.evaluate(() => {
    Reflect.deleteProperty(document, "hidden");
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(rain).toHaveCSS("animation-play-state", "running");
  await expect(page).toHaveURL(/#contact$/);
  await expect(stage).toHaveAttribute("data-lit-facade", "contact");
  await expect(stage.locator(".alley-cat")).not.toHaveAttribute("data-cat-state", /^(walk|run)$/);
});

test.describe("mobile framing", () => {
  test.use({ hasTouch: true });

  for (const [width, height] of [[320, 700], [393, 852], [412, 915], [844, 390]] as const) {
    test(`frames one complete facade at ${width}×${height}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto("/es");
      const stage = page.locator("#alley-stage");
      await expect(stage.locator(".band-street")).toHaveAttribute("style", /transform/);
      await expect(stage.locator(".band-foreground")).toHaveCSS("display", "none");
      await expect(stage.locator(".alley-rain")).toHaveCSS("animation-name", "none");
      const nav = page.getByRole("navigation", { name: "Capítulos" });
      const stops = [
        ["entrance", "Inicio"],
        ["about", "Sobre mí"],
        ["experience", "Experiencia"],
        ["contact", "Contacto"],
      ] as const;

      for (const [stop, label] of stops) {
        await nav.getByRole("link", { name: label, exact: true }).tap();
        await expect(stage).toHaveAttribute("data-lit-facade", stop);
        const storefront = stage.locator(`.storefront[data-stop="${stop}"]`);
        await expect.poll(async () => {
          const box = await storefront.boundingBox();
          return box ? Math.abs(box.x + box.width / 2 - width / 2) : Infinity;
        }).toBeLessThan(2);
        await expect(storefront.locator(".storefront-sign-plate")).toBeInViewport({ ratio: 0.99 });
        await expect(storefront.locator(".storefront-art")).toBeInViewport({ ratio: 0.99 });
        for (const [neighbor] of stops.filter(([id]) => id !== stop)) {
          await expect(stage.locator(`.storefront[data-stop="${neighbor}"]`)).not.toBeInViewport();
        }
        if (stop !== "entrance") {
          const trigger = storefront.getByRole("button");
          await expect(trigger).toBeInViewport({ ratio: 0.99 });
          const size = await trigger.boundingBox();
          expect(size?.width).toBeGreaterThanOrEqual(44);
          expect(size?.height).toBeGreaterThanOrEqual(44);
        }
      }
    });
  }
});
