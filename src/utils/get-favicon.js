const puppeteer = require("puppeteer");

async function getFavicon(url) {
  const base = new URL(url).origin;

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

  await page.goto(base, { waitUntil: "domcontentloaded" });

  // Extract favicon from the page
  const favicon = await page.evaluate(() => {
    const link =
      document.querySelector("link[rel~='icon']") ||
      document.querySelector("link[rel='shortcut icon']");

    return link ? link.href : null;
  });

  await browser.close();

  // fallback to /favicon.ico if no <link> found
  return favicon || new URL("/favicon.ico", url).href;
}

module.exports = { getFavicon };
