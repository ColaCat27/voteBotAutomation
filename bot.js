const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
const fs = require("fs");
const axios = require("axios");
const { firstPoint } = require("./points/firstPoint");

require("dotenv").config();

puppeteer.use(StealthPlugin());
puppeteer.use(
  AdblockerPlugin({
    blockTrackers: true,
  })
);

const {
  default: RecaptchaPlugin,
  BuiltinSolutionProviders,
} = require("puppeteer-extra-plugin-recaptcha");
const CapMonsterProvider = require("puppeteer-extra-plugin-recaptcha-capmonster");

CapMonsterProvider.use(BuiltinSolutionProviders);

puppeteer.use(
  RecaptchaPlugin({
    provider: {
      id: "capmonster",
      token: process.env.CAPTCHA_API, // REPLACE THIS WITH YOUR OWN CAPMONSTER API KEY ⚡
    },
    visualFeedback: true, // colorize reCAPTCHAs (violet = detected, green = solved)
  })
);

const settings = {
  threads: parseInt(process.env.THREADS),
  proxyPath: process.env.PROXY_PATH,
  targetLink: process.env.TARGET_SITE,
  apiKey: process.env.CAPTCHA_API,
};

puppeteer
  .launch({ headless: false, ignoreDefaultArgs: ["--enable-automation"] })
  .then(async (browser) => {
    const page = await browser.newPage();

    //const frame = await page.mainFrame().childFrames()[1]; (Способ взаимодействовать с фреймом)

    await page.goto(settings.targetLink);
    await page.waitForSelector("#captcha", { visible: true }).then(() => {
      console.log("Captcha finded");
    });

    await firstPoint();

    //Переход к следующей странице
    fs.unlinkSync(`${__dirname}/captchaImages/${fileName}.png`); //удаление скачаной капчи

    try {
      await page.waitForXPath("//span[contains(text(), 'Please try again!')]"); //поиск ошибки решения первой капчи
    } catch (err) {
      console.log(err);
    }

    //Решение hcaptcha капчи
    // console.log("Start solving captcha");
    // await page.solveRecaptchas();

    // await Promise.all([page.waitForNavigation(), page.click(".btn-install")]);
    //-------------------------------------------------------------------------

    // await browser.close();
  });
