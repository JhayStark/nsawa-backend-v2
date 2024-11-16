const publicRouter = require('express').Router();
const {
  confirmUserPaymentAccount,
  getBankList,
  confirmOtp,
} = require('./public.controller');

publicRouter.post('/confirm-payment-account', confirmUserPaymentAccount);
publicRouter.get('/get-banks', getBankList);
publicRouter.post('/confirm-otp', confirmOtp);

module.exports = publicRouter;
