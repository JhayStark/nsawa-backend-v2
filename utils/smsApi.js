const axios = require('axios');

const sendSms = async (recipients, message) => {
  if (
    !process.env.SENDER_ID ||
    !process.env.SMS_API ||
    !process.env.SMS_API_KEY
  ) {
    throw new Error('Missing necessary environment variables for SMS API');
  }

  if (!Array.isArray(recipients) || !recipients.length) {
    throw new Error('Recipients must be a non empty array');
  }

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
    timeout: 5000, // Set timeout to prevent hanging requests
  };

  try {
    const response = await axios(config);
    console.log(`SMS sent successfully: ${JSON.stringify(response.data)}`);
    return { success: true, data: response.data };
  } catch (error) {
    if (error.response) {
      console.error(`SMS sending failed with response: ${error.response.data}`);
      return { success: false, error: error.response.data };
    } else {
      console.error(`SMS sending failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
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
    'api-key': process.env.SMS_API_KEY,
  };
  return axios
    .post('https://sms.arkesel.com/api/otp/generate', data, { headers })
    .then(response => {
      console.log(response);
      return response;
    })
    .catch(error => {
      console.log(error);
      return error;
    });
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
