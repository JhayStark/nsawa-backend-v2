const axios = require("axios");

const sendSms = (contact) => {
  let number = [contact];
  let data = JSON.stringify({
    senderId: "Nsawan",
    contacts: number,
    message: `Thank you for donating to the New Funeral`,
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://pagezinc.com/fastapi/v1/send-sms",
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
  };

  return new Promise(function (resolve, reject) {
    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        resolve(response.data);
      })
      .catch((error) => {
        console.log(error.response.data);
        reject(error.response.data);
      });
  });
};

module.exports = { sendSms };
