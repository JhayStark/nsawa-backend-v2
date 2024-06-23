const User = require('../user/user.model');
const bcrypt = require('bcrypt');
let saltRounds = 10;
const { createAccessToken, createRefreshToken } = require('../../config/JWT');

const register = async (req, res) => {
  const { fullName, email, password } = req.body;
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
      });
      res.status(200).json({ newUser });
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

module.exports = {
  login,
  register,
};
