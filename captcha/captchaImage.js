const axios = require("axios");

module.exports.createTask = async (apiKey, imageBase64) => {
  return await axios
    .post("https://api.capmonster.cloud/createTask", {
      clientKey: apiKey,
      task: {
        type: "ImageToTextTask",
        body: imageBase64,
      },
    })
    .then((response) => {
      return response.data.taskId;
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports.getTaskResult = async (apiKey, taskId) => {
  return await axios
    .post("https://api.capmonster.cloud/getTaskResult", {
      clientKey: apiKey,
      taskId: taskId,
    })
    .then((response) => {
      return response.data;
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports.getBalance = async (apiKey) => {
  return await axios
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
