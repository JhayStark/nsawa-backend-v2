const publicRouter = require('express').Router();
const {
  confirmUserPaymentAccount,
  getBankList,
  confirmPaystackOtp,
} = require('./public.controller');

publicRouter.post('/confirm-payment-account', confirmUserPaymentAccount);
publicRouter.get('/get-banks', getBankList);
publicRouter.post('/confirm-otp', confirmPaystackOtp);

module.exports = publicRouter;
