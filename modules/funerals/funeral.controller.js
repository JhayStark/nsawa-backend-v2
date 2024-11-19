const Funeral = require('./funeral.model');
const User = require('../user/user.model');
const { sendSms, generateOtp, verifyOtp } = require('../../utils/smsApi');
const { confirmPayment } = require('../../utils/payment');

const createFuneral = async (req, res) => {
  const userId = req.user.id;
  try {
    const funeral = await Funeral.create({
      ...req.body,
      userId,
    });
    if (funeral) {
      return res.status(200).json({ id: funeral._id });
    }
  } catch (error) {
    return res.status(500).json(error);
  }
};

const editFuneral = async (req, res) => {
  const userId = req.user.id;
  const funeralId = req.params.id;
  try {
    const funeral = await Funeral.findById(funeralId);
    if (!funeral) return res.status(409).json('Funeral not Found');
    if (funeral.userId.toString() !== userId)
      return res.status(409).json('Unauthorized');

    await funeral.updateOne({
      $set: req.body,
    });
    res.status(200).json('Funeral Edited Successfully');
  } catch (error) {
    res.status(500).json(error);
  }
};

const getAllFunerals = async (req, res) => {
  const userId = req.user.id;
  const search = req.query.search || '';
  const pageSize = req.query.pageSize;
  const pageNumber = req.query.pageNumber;

  try {
    const filter = {
      $or: [
        { nameOfDeceased: { $regex: search, $options: 'i' } },
        { nameOfFuneral: { $regex: search, $options: 'i' } },
      ].filter(Boolean),
    };

    if (userId) {
      filter.userId = userId;
    }
    let funerals;
    const total = await Funeral.countDocuments(filter);
    if (pageSize && pageNumber) {
      const skip = (pageNumber - 1) * pageSize;
      funerals = await Funeral.find(filter)
        .sort({ createdAt: 1 })
        .limit(Number(pageSize))
        .skip(skip);
      res.status(200).json({
        funerals,
        total,
        pageNumber: Number(pageNumber),
        pageSize: Number(pageSize),
      });
    } else {
      funerals = await Funeral.find(filter).sort({ createdAt: -1 });
      res.status(200).json({ funerals, total });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

const getSingleFuneral = async (req, res) => {
  const funeralId = req.params.id;
  try {
    const funeral = await Funeral.findById(funeralId);
    res.status(200).json(funeral);
  } catch (error) {
    res.status(500).json(error);
  }
};

const deleteFuneral = async (req, res) => {
  const userId = req.userId;
  const { funeralId } = req.query;
  try {
    const user = User.findById(userId);
    const funeral = await Funeral.findById({ _id: funeralId });
    if (!funeral) return res.status(404).send('No funeral found');
    if (funeral.userId !== userId) return res.status(409).send('Unauthorized');
    await Funeral.findByIdAndDelete(funeralId);
    await user.updateOne({ $pull: { funerals: funeral._id } });
    return res.status(200).send('Funeral deleted');
  } catch (error) {
    return res.status(500).send('Internal Server Error');
  }
};

const sendMessages = async (req, res) => {
  const { funeralId } = req.query;
  let successCount = 0;
  let failCount = 0;
  const thankYouMessage = req.body.message;
  try {
    const donors = await Funeral.findById(funeralId, { donations: 1 }).populate(
      'donations',
      { donorPhoneNumber: 1, _id: 0 }
    );
    if (donors.length <= 0) return res.status(404).send('No donors found');
    if (donors.donations.length > 0) {
      const donorNumbers = donors.donations;
      const sending = donorNumbers.map(donor => {
        sendSms(donor.donorPhoneNumber, thankYouMessage)
          .then(response => {
            console.log(response);
            successCount += 1;
          })
          .catch(error => {
            console.log(error);
            failCount += 1;
          });
      });
      await Promise.all(sending);
      return res
        .status(200)
        .send(
          `Message sent successfully ${successCount}, failed messages: ${failCount}`
        );
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send('Internal Server Error');
  }
};

const sendWithdrawalOtp = async (req, res) => {
  try {
    console.log(req.query);
    const funeral = await Funeral.findById(req.query.funeralId);
    if (!funeral) return res.status(404).json('Funeral not found');
    await generateOtp(
      funeral.phoneNumber,
      'To confirm this transaction, please use the One-Time Password (OTP) provided below  '
    );
    res.status(200).json('Otp sent');
  } catch (error) {
    return res.status(500).send('Internal Server Error');
  }
};

const verifyWithdrawalOtp = async (req, res) => {
  try {
    const funeral = await Funeral.findById(req.body.funeralId);
    if (!funeral) return res.status(404).json('Funeral not found');
    const otp = req.body.otp;
    await verifyOtp(funeral.phoneNumber, otp);
    res.status(200).json('Otp verified');
  } catch (error) {
    return res.status(500).json('Internal Server Error');
  }
};

const addSubcriptionToFuneral = async (req, res) => {
  try {
    const paymentStatus = await confirmPayment(req.body.reference);
    if (paymentStatus.data.data.status !== 'success')
      return res.status(400).json('Payment not successful');
    console.log(req.body.funeralId);
    const funeral = await Funeral.findById(req.body.funeralId);
    if (!funeral) return res.status(404).json('Funeral not found');
    if (
      funeral.lastPaymentSubscriptionReference.paymentReference !==
      req.body.reference
    ) {
      return res.status(400).json('Payment not successful');
    }
    funeral.balance =
      funeral.balance + funeral.lastPaymentSubscriptionReference.sms;
    await funeral.save();
    res.status(200).json('Funeral subscribed');
  } catch (error) {
    console.log(error);
    return res.status(500).json('Internal Server Error');
  }
};

module.exports = {
  createFuneral,
  editFuneral,
  getAllFunerals,
  getSingleFuneral,
  deleteFuneral,
  sendMessages,
  sendWithdrawalOtp,
  addSubcriptionToFuneral,
  verifyWithdrawalOtp,
};
