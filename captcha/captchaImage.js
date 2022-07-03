const axios = require("axios");

export default solveImageCaptcha = (imageBase64) => {
  const apiKey = process.env.CAPTCHA_API;

  new Promise((resolve, reject) => {
    await axios.post("https://api.capmonster.cloud/createTask", {
      body: {
        clientKey: apiKey,
        task: {
          type: "ImageToTextTask",
          body: imageBase64,
        },
      },
    });
  });
};
