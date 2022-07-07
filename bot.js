const { Cluster } = require("puppeteer-cluster");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
const { firstPoint } = require("./points/firstPoint");
const { initSettings } = require("./settings/settings");

require("dotenv").config();

(async () => {
  //Set settings

  const settings = await initSettings();

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
        token: settings.apiKey, // REPLACE THIS WITH YOUR OWN CAPMONSTER API KEY ⚡
      },
      visualFeedback: true, // colorize reCAPTCHAs (violet = detected, green = solved)
    })
  );

  //Cluster
  const cluster = await Cluster.launch({
    puppeteer: puppeteer,
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: parseInt(settings.threads),
    puppeteerOptions: {
      headless: false,
      ignoreDefaultArgs: ["--enable-automation"],
    },
  });

  cluster.on("taskerror", (err, data, willRetry) => {
    if (willRetry) {
      console.warn(
        `Encountered an error while crawling ${data}. ${err.message}\nThis job will be retried`
      );
    } else {
      console.error(`Failed to crawl ${data}: ${err.message}`);
    }
  });

  await cluster.task(async ({ page, data: url }) => {
    await page.goto(url, {
      waitUntil: "load",
      timeout: 0,
    });
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
      // const frame = await page.mainFrame().childFrames()[1]; //(Способ взаимодействовать с фреймом)
      // await Promise.all([page.waitForNavigation(), frame.click(`#checkbox`)]);
    }
    let button;
    try {
      button = await page.waitForXPath("//div[@id='cf-norobot-container']");
    } catch {}
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
      // await cluster.idle();
      // await cluster.close();
    }
  });

  for (let i = 0; i < parseInt(settings.executions); i++) {
    await cluster.queue(settings.targetLink);
  }
})();
