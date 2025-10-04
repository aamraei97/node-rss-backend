const puppeteer = require("puppeteer");

async function extractFeed({ hrefSelector, titleSelector, timeSelector, url }) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--mute-audio"],
  });
  const page = await browser.newPage();
  page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

  console.log(`EXTRACT FEED BASE INFO`, {
    hrefSelector,
    titleSelector,
    timeSelector,
    url,
  });
  await page.goto(url, { waitUntil: "networkidle0" });

  // Extract favicon from the page
  const feedResult = await page.evaluate(
    (hrefSel, titleSel, timeSel, baseUrl) => {
      console.log("FETCH URL = get started!");

      const urls = Array.from(document.querySelectorAll(hrefSel)).map(
        (item, index) => {
          let h = item.href;
          if (h.indexOf("www") < 0 && h.indexOf("https") < 0) {
            const base = new URL(baseUrl).origin;
            h = `${base}${h}`;
          }
          console.log(`FETCH URL ${index} = url: `, h);
          return h;
        }
      );

      console.log("FETCH URL = got finished! urls length: ", urls.length);

      const titles = Array.from(document.querySelectorAll(titleSel)).map(
        (item) => item.textContent
      );

      // check if time selector present
      let times = null;
      if (timeSel) {
        console.log(`FETCH TIME = get started!`);
        times = Array.from(document.querySelectorAll(timeSel)).map(
          (item, index) => {
            // check if date format is like **.**.****
            const match =
              item.textContent.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/) ||
              item.textContent.split(" ").length === 2;
            // check if its formatable to date
            let isDate = true;
            const date = new Date(item.textContent);
            console.log(`is date: `, isNaN(date.getTime()));
            if (isNaN(date.getTime())) {
              isDate = false;
            }
            if (match || !isDate) {
              if (item.getAttribute("datetime"))
                return item.getAttribute("datetime");
            }
            console.log(`FETCH TIME ${index} = time: `, item.textContent);
            // remove th, nd from time string
            // later on we need to parse the time string to date object, so we need to keep the valid time string
            const time = item.textContent.replace(/th|nd|rd|st/g, "");
            return time;
          }
        );
        console.log(`FETCH TIME = got finished! times length: ${times.length}`);
      }

      console.log(`titles length: ${titles.length}`);
      console.log(`times length: ${times?.length}`);
      console.log(`urls length: ${urls.length}`);
      // delete duplicate feed items
      const feedItemsWithoutDuplicates =
        urls
          .map((url, index) => ({
            link: url,
            title: titles[index],
            time: times?.[index],
          }))
          .reduce((f, c) => {
            if (!f[c.link]) f[c.link] = c;

            return f;
          }, {}) ?? [];

      return Object.values(feedItemsWithoutDuplicates);
    },
    hrefSelector,
    titleSelector,
    timeSelector,
    url
  );

  await browser.close();

  console.log(
    `FETCH FEED = got finished! feedResult length: ${feedResult.length}`
  );

  // fallback to /favicon.ico if no <link> found
  return feedResult.map((item, index) => {
    let extractedTime = undefined;

    if (item.time) {
      // Parse your date components first
      const itemTime = item.time; // example

      const dateParts = new Date(itemTime);

      // Create a UTC date at midnight
      extractedTime = new Date(
        Date.UTC(
          dateParts.getFullYear(),
          dateParts.getMonth(),
          dateParts.getDate()
        )
      );
    }

    return {
      ...item,
      publishedAt: extractedTime
        ? extractedTime.toISOString()
        : new Date().toISOString(),
    };
  });
}

module.exports = { extractFeed };
