const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
const fs = require("fs");
const axios = require("axios");
const {
  createTask,
  getTaskResult,
  getBalance,
} = require("./captcha/captchaImage");
const { screenshotDOMElement } = require("./utils/screenshotDomElement");
const { randomString } = require("./utils/randomString");

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
  apiKey: process.env.CAPTCHA_API,
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

    let fileName = await randomString(5);

    while (fs.existsSync(`${__dirname}/captchaImages/${fileName}.png`)) {
      fileName = await randomString(5);
    }

    const imageBase64 = await screenshotDOMElement(
      "#captcha",
      fileName,
      page
    ).then(() => {
      let imageBase64 = fs.readFileSync(
        `${__dirname}/captchaImages/${fileName}.png`
      );
      return Buffer.from(imageBase64, "base64").toString("base64");
    });

    // let taskId = await createTask(settings.apiKey, imageBase64);
    // await page.waitForTimeout("4000");
    // console.log(`Try get captcha result`);
    // await getTaskResult(settings.apiKey, taskId);

    // await browser.close();
  });
