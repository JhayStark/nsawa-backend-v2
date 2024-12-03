const router = require('express').Router;
const {
  createDonation,
  confirmPayment,
  getDonationById,
} = require('./donations.controller');

const publicDonationRouter = router();

publicDonationRouter.post('/create', createDonation);
publicDonationRouter.post('/payment-update', confirmPayment);
publicDonationRouter.get('/status/:id', getDonationById);

module.exports = { publicDonationRouter };
