const publicRouter = require('express').Router();
const {
  confirmUserPaymentAccount,
  getBankList,
  confirmPaystackOtp,
  initiatePayment,
} = require('./public.controller');

publicRouter.post('/confirm-payment-account', confirmUserPaymentAccount);
publicRouter.get('/get-banks', getBankList);
publicRouter.post('/confirm-otp', confirmPaystackOtp);
publicRouter.post('/initiate-payment', initiatePayment);

module.exports = publicRouter;
