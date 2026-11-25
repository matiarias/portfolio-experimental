import { chromium } from "@playwright/test";
import { fileURLToPath } from "node:url";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const file = fileURLToPath(new URL("../public/media/alley-social.png", import.meta.url));
const browser = await chromium.launch();

try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto(new URL("/en", baseURL).href);
  await page.locator(".band-street[style]").waitFor();
  await page.evaluate(() => document.fonts.ready);
  // Frame the actual entrance artwork without the interactive UI.
  await page.addStyleTag({ content: `
    :root {
      --scene-gutter: 108px;
      --storefront-w: 870px;
      --storefront-gap: 150px;
      --ground-h: 112px;
    }
    .alley-hud, .alley-progress, .scroll-hint, .band-foreground { display: none; }
    .storefront-art { height: 330px; }
    .storefront[data-stop="entrance"] .storefront-sign { padding-inline-start: 28px; }
    .storefront[data-stop="entrance"] .storefront-label { font-size: 60px; }
    .storefront-role { font-size: 15px; }
    .moon { top: 10%; left: 73vw; }
    .alley-cat { width: 158px; left: 68%; }
    .alley-rain { inset: 0; opacity: 0.2; }
  ` });
  await page.screenshot({ path: file, animations: "disabled" });
} finally {
  await browser.close();
}
