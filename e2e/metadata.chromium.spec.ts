import { expect, test } from "@playwright/test";

test("serves the localized social cards and share image", async ({ page, request }) => {
  for (const [locale, alt] of [["en", /a cat in a Tokyo alley/], ["es", /un gato en un callejón/]] as const) {
    await page.goto(`/${locale}`);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/media\/alley-social\.png$/);
    await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute("content", alt);
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute("content", /\/media\/alley-social\.png$/);
  }
  const image = await request.get("/media/alley-social.png");
  expect(image.ok()).toBe(true);
  expect(image.headers()["content-type"]).toContain("image/png");
});

test("serves bilingual search metadata, the favicon and crawler routes", async ({ page, request }) => {
  await page.goto("/es");
  await expect(page).toHaveTitle(/Matias Arias.*Especialista en Frontend/);
  const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
  if (!canonical) throw new Error("Expected a canonical URL for /es");
  const english = new URL("/en", canonical).href;
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", english);
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute("href", canonical);
  const profile = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent() ?? "");
  expect(profile).toMatchObject({
    "@type": "ProfilePage",
    url: canonical,
    mainEntity: { "@type": "Person", name: "Matias Arias" },
  });
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute("href", /^\/icon\.svg(?:\?|$)/);

  const [icon, robots, sitemap] = await Promise.all([
    request.get("/icon.svg"),
    request.get("/robots.txt"),
    request.get("/sitemap.xml"),
  ]);
  expect(icon.ok()).toBe(true);
  expect(icon.headers()["content-type"]).toContain("image/svg+xml");
  expect(robots.ok()).toBe(true);
  expect(sitemap.ok()).toBe(true);
  const robotsText = await robots.text();
  const sitemapText = await sitemap.text();
  const indexing = await page.locator('meta[name="robots"]').getAttribute("content");
  if (indexing?.includes("noindex")) {
    expect(robotsText).not.toContain("Sitemap:");
    expect(sitemapText).not.toContain("<loc>");
  } else {
    expect(robotsText).toContain(`Sitemap: ${new URL("/sitemap.xml", english).href}`);
    expect(sitemapText).toContain(`<loc>${canonical}</loc>`);
    expect(sitemapText).toContain(`<loc>${english}</loc>`);
    expect(sitemapText).toContain(`hreflang="x-default" href="${canonical}"`);
  }
});
