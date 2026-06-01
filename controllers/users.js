const User = require("../models/user.js");
const passport = require("passport");
const { savedRedirectUrl } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");
const userController = require("../controllers/users.js");

module.exports.renderSignup = async (req, res) => {
    res.render("users/signup");
};

module.exports.signup = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username }); 
        const registeredUser = await User.register(user, password);
        
        req.login(registeredUser, err => {
            if (err) {
                return next(err);
            } 
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/users/signup");
    }
};

module.exports.renderLogin = async (req, res) => {
    res.render("users/login");
};

module.exports.login = async (req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect(res.locals.redirectUrl || "/listings");
};


module.exports.logout = (req, res, next) => {
    req.logout(function(err) {
        if (err) {
            return next(err);
        }

        req.flash("success", "You have been logged out!");
        res.redirect("/listings");
    });
};
