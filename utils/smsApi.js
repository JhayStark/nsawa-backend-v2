const axios = require('axios');

const sendSms = (recipients, message) => {
  const data = {
    sender: process.env.SENDER_ID,
    message,
    recipients,
  };

  const config = {
    method: 'post',
    url: process.env.SMS_API,
    headers: {
      'api-key': `${process.env.SMS_API_KEY}`,
    },
    data,
  };

  return new Promise(function (resolve, reject) {
    axios(config)
      .then(response => {
        console.log(JSON.stringify(response.data));
        resolve(response.data);
      })
      .catch(error => {
        console.log(error.response.data);
        reject(error.response.data);
      });
  });
};

const generateOtp = (number, message) => {
  const data = {
    expiry: 5,
    length: 6,
    medium: 'sms',
    message: `${message}, %otp_code%`,
    number,
    sender_id: process.env.SENDER_ID,
    type: 'numeric',
  };
  const headers = {
    'api-key': `${process.env.SMS_API_KEY}`,
  };
  return axios
    .post('https://sms.arkesel.com/api/otp/generate', data, { headers })
    .then(response => response)
    .catch(error => error);
};

const verifyOtp = (number, code) => {
  const data = {
    api_key: process.env.SMS_API_KEY,
    code,
    number,
  };
  const headers = {
    'api-key': `${process.env.SMS_API_KEY}`,
  };
  return axios
    .post('https://sms.arkesel.com/api/otp/verify', data, { headers })
    .then(response => response)
    .catch(error => error);
};

module.exports = { sendSms, generateOtp, verifyOtp };
