const ObjectId = require('mongoose').Types.ObjectId;
const Donation = require('./donations.model');
const Funeral = require('../funerals/funeral.model');
const KeyPerson = require('../keyPerson/keyPerson.model');
const { sendSms } = require('../../utils/smsApi');
const { initateMomoPay } = require('../../utils/payment');
const { getProviderCode } = require('../../utils/payment');

const sendSingleThankYouMessage = async (funeral, donation) => {
  const message = `Dear ${donation?.donorName},

On behalf of the family, we sincerely thank you for your generous donation towards the funeral of ${funeral?.nameOfDeceased}. Your support means a lot to us in this difficult time.

May God bless you abundantly for your kindness.

With gratitude,
${funeral?.familyName}`;

  if (!funeral.balance) return;
  await sendSms([donation.donorPhoneNumber], message);
  funeral.balance -= 1;
  return await funeral.save();
};

const createDonation = async (req, res) => {
  try {
    const funeral = await Funeral.findById(req.body.funeralId);
    const keyPerson = await KeyPerson.findById(req.body.keyPerson);

    if (!funeral._id.toString() || !keyPerson._id.toString())
      return res.status(404).json('Funeral or key person not found');

    const donation = await Donation.create({ ...req.body });
    if (!donation) return res.status(400).json('Donation not received');

    let showOtpModal = false;

    if (req.body.modeOfDonation == 'Cash') {
      donation.status = 'Paid';
      await donation.save();
      await sendSingleThankYouMessage(funeral, donation);
    } else {
      // Prepare payment data for mobile money payment
      const paymentData = {
        amount: donation.amountDonated * 100, // Convert to the lowest currency unit
        email: `${donation.donorPhoneNumber}@mailinator.com`, // Fallback email
        currency: 'GHS',
        mobile_money: {
          phone: donation.donorPhoneNumber,
          provider: getProviderCode(donation.donorPhoneNumber), // Resolve provider code
        },
      };

      if (paymentData.mobile_money.provider == null) {
        await Donation.findByIdAndDelete(donation._id.toString());
        return res.status(400).json('Invalid phone number');
      }
      // Initiate the mobile money payment
      const paymentResponse = await initateMomoPay(paymentData);
      showOtpModal = paymentResponse?.data?.data?.status == 'send_otp';
      const paymentReference = paymentResponse?.data?.data?.reference;
      console.log(paymentResponse?.data?.data);
      console.log(paymentReference);
      donation.reference = paymentReference;
      await donation.save();
    }

    res.status(200).json({
      id: donation?._id,
      showOtpModal,
      paymentReference: donation.reference,
    });
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
                if: { $eq: ['$modeOfDonation', 'Online'] },
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
    console.log(req.body);
    if (
      req.body.data.reference &&
      req.body.data.gateway_response == 'Approved'
    ) {
      const donation = await Donation.findOne({
        reference: req.body.data.reference,
      });
      if (!donation) return res.status(404).json('Donation not found');
      donation.status = 'Paid';
      await donation.save();
      const funeral = await Funeral.findById(donation.funeralId);
      await sendSingleThankYouMessage(funeral, donation);
    }
    res.status(200).json('Success');
  } catch (error) {
    console.log(error);
    res.status(500).json('Failed');
  }
};

const sendDonorThankYouMessages = async (req, res) => {
  try {
    const thankYouMessage = req.body.message;
    const funeralId = req.body.funeralId;

    //Fetch the funeral
    const funeral = await Funeral.findById(funeralId);

    //Check if funeral has sms balance
    if (!funeral.balance) {
      return res.status(400).json('Insufficient SMS balance');
    }

    // Fetch donors for the given funeral ID
    const donors = await Donation.find({ funeralId });

    if (!donors?.length) return res.status(404).send('No donors found');

    // Extract phone numbers from the donor list
    const recipientPhoneNumbers = donors.map(donor => donor.donorPhoneNumber);

    //limit recipient phone numbers to sms balance
    const limitedRecipientPhoneNumbers = recipientPhoneNumbers.slice(
      0,
      funeral.balance
    );

    // Check if we have recipients to send the message to
    if (limitedRecipientPhoneNumbers.length) {
      try {
        // Send the SMS to all donors in a single call
        const response = await sendSms(
          limitedRecipientPhoneNumbers,
          thankYouMessage
        );
        if (response.success) {
          // Update the funeral balance
          funeral.balance -= limitedRecipientPhoneNumbers.length;
          await funeral.save();
          return res
            .status(200)
            .json(
              `Messages sent successfully to ${limitedRecipientPhoneNumbers.length} donors`
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
    res.status(500).json('Internal Server Error');
  }
};

module.exports = {
  createDonation,
  getDonations,
  donationStats,
  confirmPayment,
  sendDonorThankYouMessages,
};
