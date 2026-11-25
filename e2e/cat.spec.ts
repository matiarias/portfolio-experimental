import { expect, test } from "@playwright/test";

test("animates the gait on physical travel and sits when the street stops", async ({ page }) => {
  await page.goto("/en");
  const cat = page.locator(".alley-cat");
  await expect(page.locator(".band-street")).toHaveAttribute("style", /transform/);
  const leg = cat.locator('[data-cat-part="front-near"]');
  const standing = await leg.getAttribute("transform");
  await page.evaluate(() => {
    const stage = document.getElementById("alley-stage");
    const cat = stage?.querySelector<HTMLElement>(".alley-cat");
    if (!stage || !cat) return;
    const observe = new MutationObserver((records) => {
      const hasGait = records.some(({ oldValue }) => /^(walk|run)$/.test(oldValue ?? ""));
      if (hasGait || /^(walk|run)$/.test(cat.dataset.catState ?? "")) {
        cat.dataset.observedGait = "true";
        observe.disconnect();
      }
    });
    observe.observe(cat, { attributes: true, attributeFilter: ["data-cat-state"], attributeOldValue: true });
    window.scrollTo(0, (stage.offsetHeight - window.innerHeight) * 0.17);
  });
  await expect(cat).toHaveAttribute("data-observed-gait", "true");
  await expect.poll(async () => leg.getAttribute("transform")).not.toBe(standing);
  await expect(cat).toHaveAttribute("data-cat-state", "sit");
  await expect(cat.locator('[data-cat-part="haunch"]')).toHaveCSS("opacity", "1");
});

test("never walks on a direct link and can be petted with the keyboard", async ({ page }) => {
  await page.addInitScript(() => {
    const monitor = new MutationObserver((records) => {
      if (records.some(({ target, oldValue }) => {
        const next = (target as HTMLElement).dataset.catState;
        return [oldValue, next].some((value) => value === "walk" || value === "run");
      })) document.documentElement.dataset.catWalked = "true";
    });
    monitor.observe(document, { subtree: true, attributes: true, attributeFilter: ["data-cat-state"], attributeOldValue: true });
  });
  await page.goto("/es#experience");
  await expect(page.locator("main")).toHaveAttribute("data-active-stop", "experience");
  const cat = page.locator(".alley-cat");
  await expect(cat).toHaveAttribute("data-cat-state", "sit");
  await expect(page.locator("html")).not.toHaveAttribute("data-cat-walked", "true");
  const button = page.getByRole("button", { name: "Acariciar al gato" });
  await button.focus();
  await button.press("Enter");
  await expect(cat).toHaveAttribute("data-cat-state", "pet");
  await expect(cat.getByRole("status")).toHaveText("El gato se acurruca.");
  await expect(cat).toHaveAttribute("data-cat-state", "sit");
});

test("looks up toward a nearby mouse pointer", async ({ page }) => {
  await page.goto("/en");
  const cat = page.locator(".alley-cat");
  await expect(page.locator(".band-street")).toHaveAttribute("style", /transform/);
  const box = await cat.boundingBox();
  if (!box) throw new Error("Cat is not visible");
  await page.mouse.move(box.x + box.width * 0.8, box.y - box.height * 0.3);
  await expect(cat).toHaveAttribute("data-cat-state", "lookUp");
  const pupils = cat.locator('[data-cat-part="pupils"]');
  await expect(pupils).toHaveAttribute("transform", /^matrix\(1,0,0,1,[^,]+,-[^)]+\)$/);
});

test("falls asleep after ten seconds at rest", async ({ page }) => {
  await page.clock.install();
  await page.goto("/en");
  await expect(page.locator(".band-street")).toHaveAttribute("style", /transform/);
  const cat = page.locator(".alley-cat");
  await page.clock.fastForward(1_400);
  await expect(cat).toHaveAttribute("data-cat-state", "sit");
  await page.clock.fastForward(9_000);
  await expect(cat).toHaveAttribute("data-cat-state", "sleep");
  await expect(cat.locator('[data-cat-part="closed-eyes"]')).toHaveCSS("opacity", "1");
});

test.describe("touch", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("reacts to a tap", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator(".band-street")).toHaveAttribute("style", /transform/);
    await page.getByRole("button", { name: "Pet the cat" }).tap();
    await expect(page.locator(".alley-cat")).toHaveAttribute("data-cat-state", "pet");
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("keeps the cat out of reading mode", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("main")).toHaveAttribute("data-mode", "reading");
    await expect(page.locator(".alley-cat")).toHaveCount(0);
  });
});
