const axios = require('axios');

const paymentInstance = axios.create({
  baseURL: process.env.PAYMENT_SERVICE_URL,
  headers: {
    'api-key': process.env.PAYMENT_SERVICE_KEY,
    'Content-Type': 'application/json',
  },
});

const confirmAccount = async data =>
  paymentInstance.post('/confirm-account', data);

const getBanks = async type => {
  let url = 'https://api.paystack.co/bank?currency=GHS';
  if (type) {
    url = `${url}&type=${type}`;
  }
  return axios.get(url);
};

const initateMomoPay = async data =>
  paymentInstance.post(`/payment/momo-pay`, data);

const initiateWithdrawal = async data =>
  paymentInstance.post(`/payment/withdraw`, data);

const confirmOtp = async data =>
  paymentInstance.post(`/payment/confirm-otp`, data);

const confirmPayment = async reference =>
  paymentInstance.get(`/payment/confirm-payment?reference=${reference}`);

const phoneNumberConfig = {
  airtelTigo: { code: 'ATL', prefix: ['026', '027', '056', '057'] },
  mtn: { code: 'MTN', prefix: ['025', '024', '053', '054', '055', '059'] },
  vodafone: { code: 'VOD', prefix: ['020', '050'] },
};

const getProviderCode = phoneNumber => {
  const prefix = phoneNumber.substring(0, 3);
  for (const provider in phoneNumberConfig) {
    if (phoneNumberConfig[provider].prefix.includes(prefix)) {
      return phoneNumberConfig[provider].code;
    }
  }
  return null;
};

module.exports = {
  confirmAccount,
  getBanks,
  initiateWithdrawal,
  initateMomoPay,
  confirmPayment,
  confirmOtp,
  getProviderCode,
};
