const router = require('express').Router;
const {
  createDonation,
  donationStats,
  getDonations,
  sendDonorThankYouMessages,
} = require('./donations.controller');

const donationRouter = router();

donationRouter.post('/create', createDonation);
donationRouter.get('/stats/:id', donationStats);
donationRouter.get('/:id', getDonations);
donationRouter.post('/thank-you-message', sendDonorThankYouMessages);

module.exports = { donationRouter };
