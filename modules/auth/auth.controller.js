const User = require('../user/user.model');
const bcrypt = require('bcrypt');
let saltRounds = 10;
const { createAccessToken, createRefreshToken } = require('../../config/JWT');
const { generateOtp, verifyOtp } = require('../../utils/smsApi');

const register = async (req, res) => {
  const { fullName, email, password, phoneNumber } = req.body;
  console.log(req.body);
  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(409).json({ message: 'User already Exists ' });

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    if (hashedPassword) {
      const newUser = await User.create({
        fullName,
        email,
        password: hashedPassword,
        phoneNumber,
      });
      const userObject = {
        id: newUser?._id?.toString(),
        userName: newUser?.fullName,
      };
      const token = createAccessToken(userObject);
      const refreshToken = createRefreshToken(userObject);

      newUser.refreshToken = refreshToken;
      await newUser.save();

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000,
        secure: true,
      });

      res.status(200).json({ token, userName: newUser?.fullName });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const userObject = {
      id: user?._id?.toString(),
      userName: user?.fullName,
    };

    const token = createAccessToken(userObject);
    const refreshToken = createRefreshToken(userObject);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000,
      secure: true,
    });

    res.status(200).json({ token, userName: user?.fullName });
  } catch (error) {
    res.status(500).json(error);
  }
};

const sendResetPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await generateOtp(
      user.phoneNumber,
      'Enter the following code to reset your password'
    );
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json(error);
  }
};

const verifyResetPasswordOtp = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    const user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const response = await verifyOtp(user.phoneNumber, otp);
    console.log(response);
    if (response.status !== 200) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  login,
  register,
  verifyResetPasswordOtp,
  sendResetPasswordOtp,
};
