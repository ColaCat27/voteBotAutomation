const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
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

    await firstPoint(page, settings);
    let isExist;

    try {
      isExist = await page.waitForXPath(
        "//span[contains(text(), 'Please try again!')]",
        {
          //поиск ошибки решения первой капчи
          timeout: 4500,
        }
      );
    } catch {}

    if (isExist) {
      await firstPoint(page, settings);
      return;
    }

    try {
      isExist = await page.waitForXPath("//div[@id='cf-hcaptcha-container']", {
        timeout: 3000,
      });
    } catch {}

    if (isExist) {
      console.log("Начинаю разгадывание hcaptcha");

      await page.solveRecaptchas();
      console.log("Капча решена");
      await page.waitForNavigation();
      // const frame = await page.mainFrame().childFrames()[1]; //(Способ взаимодействовать с фреймом)
      // await Promise.all([page.waitForNavigation(), frame.click(`#checkbox`)]);
    }

    button = await page.waitForXPath("//div[@id='cf-norobot-container']");

    if (button) {
      await button.click();
    }

    try {
      isExist = await page.waitForXPath("//div[@id='middleba']", {
        timeout: 3000,
        visible: true,
      });
    } catch {}

    if (!isExist) {
      console.log("Не удалось проголосовать пытаюсь еще раз");
      await page.goto(settings.targetLink);

      await firstPoint(page, settings);
      return;
    } else {
      console.log("Успешно проголосовал за сервер");
      await browser.close();
    }
    // await Promise.all([page.waitForNavigation(), page.click(".btn-install")]);
    // -------------------------------------------------------------------------
  });
