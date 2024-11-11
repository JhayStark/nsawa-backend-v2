const UserRouter = require('express').Router();
const { updateUserProfile } = require('./user.controller');

UserRouter.patch('/update-profile', updateUserProfile);

module.exports = UserRouter;
