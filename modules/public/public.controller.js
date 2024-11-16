const { confirmAccount, getBanks } = require('../../utils/paystack');
const { confirmOtp } = require('../../utils/payment');

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

module.exports = { confirmUserPaymentAccount, getBankList, confirmPaystackOtp };
