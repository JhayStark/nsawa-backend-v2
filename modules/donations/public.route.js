const router = require('express').Router;
const {
  createDonation,
  confirmPaymentViaWebhook,
  getDonationById,
} = require('./donations.controller');

const publicDonationRouter = router();

publicDonationRouter.post('/create', createDonation);
publicDonationRouter.post('/payment-update', confirmPaymentViaWebhook);
publicDonationRouter.get('/status/:id', getDonationById);

module.exports = { publicDonationRouter };
