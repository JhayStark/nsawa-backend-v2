const router = require("express").Router;
const { login, register } = require("./auth.controller");

const authRouter = router();

authRouter.post("/login", login);
authRouter.post("/register", register);

module.exports = { authRouter };
