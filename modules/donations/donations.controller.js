const ObjectId = require('mongoose').Types.ObjectId;
const Donation = require('./donations.model');
const Funeral = require('../funerals/funeral.model');
const KeyPerson = require('../keyPerson/keyPerson.model');

const createDonation = async (req, res) => {
  try {
    const funeral = await Funeral.findById(req.body.funeralId);
    const keyPerson = await KeyPerson.findById(req.body.keyPerson);
    if (!funeral || !keyPerson)
      return res.status(404).json('Funeral or key person not found');
    const donation = await Donation.create({ ...req.body });
    if (!donation) return res.status(400).json('Donation not received');
    res.status(200).json('Donation received ');
  } catch (error) {
    res.status(500).json(error);
  }
};

const getDonations = async (req, res) => {
  const funeralId = req.params.id;
  const search = req.query.search || '';
  const pageSize = req.query.pageSize || 10;
  const pageNumber = req.query.pageNumber || 1;
  const skip = (pageNumber - 1) * pageSize;

  console.log(funeralId);
  try {
    const filter = {
      $or: [
        { donorName: { $regex: search, $options: 'i' } },
        { donorEmail: { $regex: search, $options: 'i' } },
      ].filter(Boolean),
    };

    filter.funeralId = funeralId;

    const total = await Donation.countDocuments(filter);
    const donations = await Donation.find(filter)
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(skip);
    res.status(200).json({ donations, total, pageNumber, pageSize });
  } catch (error) {
    res.status(500).json(error);
  }
};

const donationStats = async (req, res) => {
  const funeralId = req.params.id;
  try {
    const donations = await Donation.aggregate([
      {
        $match: { funeralId: new ObjectId(funeralId) },
      },
      {
        $group: {
          _id: null,
          totalDonations: { $sum: '$amountDonated' },
          totalCashDonations: {
            $sum: {
              $cond: {
                if: { $eq: ['$modeOfDonation', 'Cash'] },
                then: '$amountDonated',
                else: 0,
              },
            },
          },
          totalMomoDonations: {
            $sum: {
              $cond: {
                if: { $eq: ['$modeOfDonation', 'Momo'] },
                then: '$amountDonated',
                else: 0,
              },
            },
          },
        },
      },
    ]);

    let donationsData = donations[0];
    if (!donations.length) {
      donationsData = {
        totalDonations: 0,
        totalCashDonations: 0,
        totalMomoDonations: 0,
      };
    }

    res.status(200).json(donationsData);
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json(error);
  }
};

module.exports = { createDonation, getDonations, donationStats };
