const { randomString } = require("./utils/randomString");

module.exports.prepareDir = async () => {
    return await new Promise((resolve, reject) => {
        let fileName = await randomString(5);

        if (!fs.existsSync(`${__dirname}/captchaImages/`)) {
        fs.mkdirSync(`${__dirname}/captchaImages/`);
        }

        while (fs.existsSync(`${__dirname}/captchaImages/${fileName}.png`)) {
        fileName = await randomString(5);
        }

        return resolve(fileName);
    })
}