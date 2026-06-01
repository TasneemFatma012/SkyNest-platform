const express = require("express");
const app = express();
const path = require("path");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { savedRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");


router.use(savedRedirectUrl);

router.route("/signup")
.get(userController.renderSignup)
.post(wrapAsync(userController.signup));

router.route("/login")
.get(userController.renderLogin)
.post(savedRedirectUrl, passport.authenticate("local", { failureFlash: true, failureRedirect: "/users/login" }), 
userController.login);

router.post("/logout", userController.logout);


module.exports = router;