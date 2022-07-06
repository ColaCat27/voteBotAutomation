const {prepareDir} = require('../prepareDir');
const {screenshotDOMElement} = require('../utils/screenshotDomElement');
const {createTask, getTaskResult, getBalance} = require('../utils/solveImageCaptcha')


module.exports.firstPoint = async () => {
   return await new Promise((resolve, reject) => {
    let fileName = await prepareDir(); //Проверяем создана ли директория для хранения капчи, а также сущесвует ли файл с будующим названием картинки с капчей

    //скрин капчи сохранение и чтение в base64
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

    //решение капчи
    let taskId = await createTask(settings.apiKey, imageBase64);
    console.log(`Task id: ${taskId}`);
    let isError = null;
    let captchaResult = "processing";

    await page.waitForTimeout("4000");

    while (captchaResult == "processing" && isError === null) {
      let { errorId, status, solution } = await getTaskResult(
        settings.apiKey,
        taskId
      );

      console.log(
        `ErrorId: ${errorId}\nStatus: ${status}\nSolution: ${solution.text}`
      );

      if (errorId == 1) {
        isError = "error";
        console.log(isError);
      }

      if (status != "processing") {
        console.log(solution.text);
        captchaResult = solution.text;
      } else {
        captchaResult = status;
      }

      await page.waitForTimeout("4000"); // задержка после решения капчи
    }

    await page.type("input[name=captcha_code]", captchaResult + "123");
    await page.click("input[name=ticki]"); //подтверждаем ввод первой капчи
    resolve()
   })
};
