const router = require('express').Router;
const { createDonation, confirmPayment } = require('./donations.controller');

const publicDonationRouter = router();

publicDonationRouter.post('/create', createDonation);
publicDonationRouter.post('/payment-update', confirmPayment);

module.exports = { publicDonationRouter };
