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

// {
//   "amount": 1,
//   "email": "customer@email.com",
//   "currency": "GHS",
//   "mobile_money": {
//     "phone": "0247380359",
//     "provider": "mtn"
//   }
// }

const initateMomoPay = async data =>
  paymentInstance.post(`/payment/momo-pay`, data);

// {
//     "type": "mobile_money",
//     "name": "Joel Edem Amenuvor",
//     "currency": "GHS",
//     "account_number": "0247380359",
//     "bank_code": "MTN",
//     "reason":"test withdrawal",
//     "amount":100
// }

const initiateWithdrawal = async data =>
  paymentInstance.post(`/payment/withdraw`, data);

const confirmOtp = async data =>
  paymentInstance.post(`/payment/confirm-otp`, data);

const confirmPayment = async reference =>
  paymentInstance.get(`/payment/confirm-payment?reference=${reference}`);

module.exports = {
  confirmAccount,
  getBanks,
  initiateWithdrawal,
  initateMomoPay,
  confirmPayment,
  confirmOtp,
};
