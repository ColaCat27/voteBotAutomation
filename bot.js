const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");

require("dotenv").config();

puppeteer.use(StealthPlugin());
puppeteer.use(
  AdblockerPlugin({
    blockTrackers: true,
  })
);

const settings = {
  threads: parseInt(process.env.THREADS),
  proxyPath: process.env.PROXY_PATH,
  targetLink: process.env.TARGET_SITE,
};

puppeteer
  .launch({
    headless: false,
    args: ["--start-maximized"],
    ignoreDefaultArgs: ["--enable-automation"],
    waitUntil: "networkidle2",
  })
  .then(async (browser) => {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    await page.goto(settings.targetLink);
    await page.waitForSelector("#captcha", { visible: true }).then(() => {
      console.log("Captcha finded");
    });
    const captcha = await page.$eval("#captcha", (el) => el.src);
    console.log(`Captcha link: ${captcha}`);
    await browser.close();
  });
