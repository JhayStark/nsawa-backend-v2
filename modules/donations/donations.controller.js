const ObjectId = require('mongoose').Types.ObjectId;
const Donation = require('./donations.model');
const Funeral = require('../funerals/funeral.model');
const KeyPerson = require('../keyPerson/keyPerson.model');
const { sendSms } = require('../../utils/smsApi');

const createDonation = async (req, res) => {
  try {
    const funeral = await Funeral.findById(req.body.funeralId);
    const keyPerson = await KeyPerson.findById(req.body.keyPerson);
    const selectedKeyPerson = req.body.keyPerson;
    if (!funeral || (selectedKeyPerson && !keyPerson))
      return res.status(404).json('Funeral or key person not found');
    const donation = await Donation.create({ ...req.body });
    if (!donation) return res.status(400).json('Donation not received');

    const message = `Dear ${donation?.donorName},

On behalf of the family, we sincerely thank you for your generous donation towards the funeral of ${funeral?.nameOfDeceased}. Your support means a lot to us in this difficult time.

May God bless you abundantly for your kindness.

With gratitude,
${funeral?.familyName}`;

    sendSms([donation?.donorPhoneNumber], message)
      .then(res => console.log(res?.data))
      .catch(err => console.log(err));

    res.status(200).json({ id: donation?._id });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const getDonations = async (req, res) => {
  const funeralId = req.params.id;
  const search = req.query.search || '';
  const pageSize = req.query.pageSize || 10;
  const pageNumber = req.query.pageNumber || 1;
  const skip = (pageNumber - 1) * pageSize;
  const paymentMethod = req.query.paymentMethod || '';

  try {
    const filter = {
      $or: [
        { donorName: { $regex: search, $options: 'i' } },
        { donorEmail: { $regex: search, $options: 'i' } },
      ].filter(Boolean),
    };

    filter.funeralId = funeralId;
    if (paymentMethod) {
      filter.modeOfDonation = paymentMethod;
    }

    const total = await Donation.countDocuments(filter);
    const donations = await Donation.find(filter)
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(skip)
      .populate('keyPerson');
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
          numberOfDonations: { $sum: 1 },
        },
      },
    ]);

    let donationsData = donations[0];
    if (!donations.length) {
      donationsData = {
        totalDonations: 0,
        totalCashDonations: 0,
        totalMomoDonations: 0,
        numberOfDonations: 0,
      };
    }

    res.status(200).json(donationsData);
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json(error);
  }
};

const confirmPayment = async (req, res) => {
  try {
    if (req.body.data.reference && req.body.gateway_response == 'Approved') {
      const donation = await Donation.findOne({
        reference: req.body.data.reference,
      });
      if (!donation) return res.status(404).json('Donation not found');
      donation.status = 'Paid';
      await donation.save();
    }
    return res.status(200).json('Success');
  } catch (error) {
    console.log(error);
    return res.status(500).json('Failed');
  }
};

const sendDonorThankYouMessages = async (req, res) => {
  try {
    const thankYouMessage = req.body.message;
    const funeralId = req.body.funeralId;

    //Fetch the funeral
    const funeral = await Funeral.findById(funeralId);

    //Check if funeral has sms balance
    // if (funeral.balance <= 0) {
    //   return res.status(400).json('Insufficient SMS balance');
    // }

    // Fetch donors for the given funeral ID
    const donors = await Donation.find({ funeralId });

    if (!donors?.length) return res.status(404).send('No donors found');

    // Extract phone numbers from the donor list
    const recipientPhoneNumbers = donors.map(donor => donor.donorPhoneNumber);

    //limit recipient phone numbers to sms balance
    // const limitedRecipientPhoneNumbers = recipientPhoneNumbers.slice(
    //   0,
    //   funeral.balance
    // );

    // Check if we have recipients to send the message to
    if (recipientPhoneNumbers.length > 0) {
      try {
        // Send the SMS to all donors in a single call
        const response = await sendSms(recipientPhoneNumbers, thankYouMessage);
        if (response.success) {
          // Update the funeral balance
          // funeral.balance -= recipientPhoneNumbers.length;
          // await funeral.save();
          return res
            .status(200)
            .json(
              `Messages sent successfully to ${recipientPhoneNumbers.length} donors`
            );
        } else {
          return res
            .status(500)
            .json(`Failed to send messages: ${response.error}`);
        }
      } catch (error) {
        console.error(`Failed to send SMS: ${error}`);
        return res.status(500).json('Failed to send messages');
      }
    } else {
      return res.status(404).json('No valid phone numbers found for donors');
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json('Internal Server Error');
  }
};

module.exports = {
  createDonation,
  getDonations,
  donationStats,
  confirmPayment,
  sendDonorThankYouMessages,
};
