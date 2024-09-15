const publicRouter = require('express').Router();
const {
  confirmUserPaymentAccount,
  getBankList,
} = require('./public.controller');

publicRouter.post('/confirm-payment-account', confirmUserPaymentAccount);
publicRouter.get('/get-banks', getBankList);

module.exports = publicRouter;
