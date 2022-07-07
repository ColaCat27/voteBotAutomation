const input = require("input");
const fs = require("fs");

module.exports.initSettings = async () => {
  const settings = {};
  settings.threads = await input.text("Количество потоков", {
    validate(answer) {
      let value = parseInt(answer);
      if (!Boolean(value)) {
        console.log(` Укажите число > 0, а не строку`);
      }
      if (value === 0) {
        console.log(` Количество потоков должно быть > 0`);
      }
      return true;
    },
  });

  settings.executions = await input.text("Количество выполнений", {
    validate(answer) {
      let value = parseInt(answer);
      if (!Boolean(value)) {
        console.log(` Укажите число > 0, а не строку`);
      }
      if (value === 0) {
        console.log(` Количество выполнений должно быть > 0`);
      }
      return true;
    },
  });

  settings.proxyPath = await input.text("Путь к файлу с прокси", {
    validate(answer) {
      if (!fs.existsSync(answer)) {
        console.log(" Укажите правильный путь, файл с прокси не найден");
      }
      if (!answer.length) {
        console.log(" Укажите путь к файлу с прокси");
      }
      return true;
    },
  });

  settings.targetLink = await input.text("Ссылка на сайт", {
    validate(answer) {
      if (!/http(s|):\/\/(www\.|).*(?=\.)/gm.test(answer)) {
        console.log(" Укажите настоящую ссылку");
      }
      if (!answer.length) {
        console.log(" Укажите ссылку");
      }
      return true;
    },
  });

  settings.apiKey = await input.text("API ключ для капчи", {
    validate(answer) {
      if (!answer.length) {
        console.log(" Укажите Capmonster API KEY");
      }
      return true;
    },
  });
  return settings;
};
