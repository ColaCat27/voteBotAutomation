const fs = require("fs");
const { randomString } = require("./randomString");

module.exports.prepareDir = async () => {
  let fileName = await randomString(5);

  if (!fs.existsSync(`${__dirname}/../captchaImages/`)) {
    fs.mkdirSync(`${__dirname}/../captchaImages/`);
  }

  while (fs.existsSync(`${__dirname}/../captchaImages/${fileName}.png`)) {
    fileName = await randomString(5);
  }

  return fileName;
};
