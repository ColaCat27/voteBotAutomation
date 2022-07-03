const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
const fs = require("fs");
const axios = require("axios");
const solveImageCaptcha = require("./captcha/captchaImage");

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
    // const captcha = await page.$eval("#captcha", (el) => el.src);
    // console.log(`Captcha link: ${captcha}`);

    async function screenshotDOMElement(selector, padding = 0) {
      const rect = await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        const { x, y, width, height } = element.getBoundingClientRect();
        return { left: x, top: y, width, height, id: element.id };
      }, selector);

      return await page.screenshot({
        path: "./element.png",
        clip: {
          x: rect.left - padding,
          y: rect.top - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
        },
      });
    }

    await screenshotDOMElement("#captcha");

    const base64 = fs.readFileSync("./element.png");
    // await solveCaptchaImage(base64);

    // const downloadImage = (url, image_path) =>
    //   axios({
    //     url,
    //     responseType: "stream",
    //   }).then(
    //     (response) =>
    //       new Promise((resolve, reject) => {
    //         response.data
    //           .pipe(fs.createWriteStream(image_path))
    //           .on("finish", () => resolve())
    //           .on("error", (e) => reject(e));
    //       })
    //   );

    // downloadImage(captcha, "./captchas/");
    // await browser.close();
  });
