const router = require('express').Router;
const {
  createDonation,
  donationStats,
  getDonations,
} = require('./donations.controller');

const donationRouter = router();

donationRouter.post('/create', createDonation);
donationRouter.get('/stats/:id', donationStats);
donationRouter.get('/:id', getDonations);

module.exports = { donationRouter };
