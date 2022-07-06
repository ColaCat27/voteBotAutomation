const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
const { firstPoint } = require("./points/firstPoint");
const input = require("input");
const os = require("os");
const fs = require("fs");

const cpuLength = os.cpus().length; //узнаем количество ядер

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

const main = async () => {
  //Set settings
  const settings = {};
  settings.threads = await input.text("Set threads count", {
    validate(answer) {
      let value = parseInt(answer);
      if (!Boolean(value)) {
        console.log(` Укажите число > 0 и < ${cpuLength}, а не строку`);
      }
      if (value === 0) {
        console.log(` Количество потоков должно быть > 0 и < ${cpuLength}`);
      }
      if (value > cpuLength) {
        console.log(
          ` Вам доступно не больше ${cpuLength} потоков, введите число не больше ${cpuLength}`
        );
      }
    },
  });

  settings.proxyPath = await input.text("Set proxy path", {
    validate(answer) {
      if (!fs.existsSync(answer)) {
        console.log("Укажите правильный путь, файл с прокси не найден");
      }
      if (!answer.length) {
        console.log("Укажите путь к файлу с прокси");
      }
    },
  });

  settings.targetLink = await input.text("Set target link", {
    validate(answer) {
      if (!/http(s|):\/\/(www\.|).*(?=\.)/gm.test(answer)) {
        console.log("Укажите настоящую ссылку");
      }
      if (!answer.length) {
        console.log("Укажите ссылку");
      }
    },
  });

  settings.apiKey = await input.text("Set capmonster api key", {
    validate(answer) {
      if (!answer.length) {
        console.log("Укажите Capmonster API KEY");
      }
    },
  });

  //----------------------
  // puppeteer
  //   .launch({ headless: false, ignoreDefaultArgs: ["--enable-automation"] })
  //   .then(async (browser) => {
  //     const page = await browser.newPage();

  //     //const frame = await page.mainFrame().childFrames()[1]; (Способ взаимодействовать с фреймом)

  //     await page.goto(settings.targetLink);

  //     await firstPoint(page, settings);
  //     let isExist;

  //     try {
  //       isExist = await page.waitForXPath(
  //         "//span[contains(text(), 'Please try again!')]",
  //         {
  //           //поиск ошибки решения первой капчи
  //           timeout: 4500,
  //         }
  //       );
  //     } catch {}

  //     if (isExist) {
  //       await firstPoint(page, settings);
  //       return;
  //     }

  //     try {
  //       isExist = await page.waitForXPath("//div[@id='cf-hcaptcha-container']", {
  //         timeout: 3000,
  //       });
  //     } catch {}

  //     if (isExist) {
  //       console.log("Начинаю разгадывание hcaptcha");

  //       await page.solveRecaptchas();
  //       console.log("Капча решена");
  //       await page.waitForNavigation();
  //       // const frame = await page.mainFrame().childFrames()[1]; //(Способ взаимодействовать с фреймом)
  //       // await Promise.all([page.waitForNavigation(), frame.click(`#checkbox`)]);
  //     }
  //     let button;
  //     try {
  //       button = await page.waitForXPath("//div[@id='cf-norobot-container']");
  //     } catch {}

  //     if (button) {
  //       await button.click();
  //     }

  //     try {
  //       isExist = await page.waitForXPath("//div[@id='middleba']", {
  //         timeout: 3000,
  //         visible: true,
  //       });
  //     } catch {}

  //     if (!isExist) {
  //       console.log("Не удалось проголосовать пытаюсь еще раз");
  //       await page.goto(settings.targetLink);

  //       await firstPoint(page, settings);
  //       return;
  //     } else {
  //       console.log("Успешно проголосовал за сервер");
  //       await browser.close();
  //     }
  //     // await Promise.all([page.waitForNavigation(), page.click(".btn-install")]);
  //     // -------------------------------------------------------------------------
  //   });
};

main();
