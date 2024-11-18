const { confirmAccount, getBanks } = require('../../utils/paystack');
const { confirmOtp, initateMomoPay } = require('../../utils/payment');
const { phoneNumberConfig } = require('../../utils/payment');
const Funeral = require('../funerals/funeral.model');

const confirmUserPaymentAccount = async (req, res) => {
  try {
    const { accountNumber, bankCode } = req.body;
    const response = await confirmAccount(accountNumber, bankCode);
    if (response?.status) {
      return res.status(200).json({ data: response?.data });
    } else {
      return res.status(400).json({ error: response?.message });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const getBankList = async (req, res) => {
  try {
    const type = req.query?.type || '';
    const response = await getBanks(type);
    if (response?.status) {
      return res.status(200).json({ data: response?.data });
    } else {
      return res.status(400).json({ error: response?.message });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const confirmPaystackOtp = async (req, res) => {
  try {
    const data = {
      reference: req.body.reference,
      otp: req.body.otp,
    };
    await confirmOtp(data);
    res.status(200).json({ message: 'OTP confirmed' });
  } catch (error) {
    res.status(500).json(error);
  }
};

const initiatePayment = async (req, res) => {
  try {
    const { phoneNumber, amount, funeralId } = req.body;
    const paymentData = {
      amount: amount * 100, // Convert to the lowest currency unit
      email: `${phoneNumber}@mailinator.com`, // Fallback email
      currency: 'GHS',
      mobile_money: {
        phone: phoneNumber,
        provider: getProviderCode(phoneNumber), // Resolve provider code
      },
    };

    if (paymentData.mobile_money.provider == null) {
      return res.status(400).json('Invalid phone number');
    }
    // Initiate the mobile money payment
    const paymentResponse = await initateMomoPay(paymentData);
    const showOtpModal = paymentResponse?.data?.data?.status == 'send_otp';
    const paymentReference = paymentResponse?.data?.data?.reference;
    await Funeral.findByIdAndUpdate(funeralId, {
      lastPaymentSubscriptionReference: paymentReference,
    });
    res.status(200).json({
      showOtpModal,
      paymentReference,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  confirmUserPaymentAccount,
  getBankList,
  confirmPaystackOtp,
  initiatePayment,
};
