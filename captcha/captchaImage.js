const axios = require("axios");

module.exports.createTask = async (apiKey, imageBase64) => {
  await axios
    .post("https://api.capmonster.cloud/createTask", {
      clientKey: apiKey,
      task: {
        type: "ImageToTextTask",
        body: imageBase64,
      },
    })
    .then((response) => {
      console.log(response.data.taskId);
      return response.data.taskId;
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports.getTaskResult = async (apiKey, taskId) => {
  await axios
    .post("https://api.capmonster.cloud/getTaskResult", {
      clientKey: apiKey,
      taskId: taskId,
    })
    .then((response) => {
      if (response.res.statusCode === 200) {
        return response.data.taskId;
      } else {
        console.log(`Status code: ${response.res.statusCode}`);
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports.getBalance = async (apiKey) => {
  await axios
    .post("https://api.capmonster.cloud/getBalance", {
      clientKey: apiKey,
    })
    .then((response) => {
      console.log(response);
    })
    .catch((err) => {
      console.log(err);
    });
};
