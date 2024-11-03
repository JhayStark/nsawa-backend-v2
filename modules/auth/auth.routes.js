const router = require('express').Router;
const {
  login,
  register,
  sendResetPasswordOtp,
  verifyResetPasswordOtp,
} = require('./auth.controller');

const authRouter = router();

authRouter.post('/login', login);
authRouter.post('/register', register);
authRouter.post('/send-reset-password-otp', sendResetPasswordOtp);
authRouter.post('/verify-reset-password-otp', verifyResetPasswordOtp);

module.exports = { authRouter };
