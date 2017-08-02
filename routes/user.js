const nodemailer = require("nodemailer");
const validator  = require("express-validator");
const passport   = require("../middleware/passport");
const password   = require("../middleware/password");
const express    = require("express");
const crypto     = require("crypto");
const User       = require("../models/user");
const url        = require("url");


// create router
const router = express.Router();


router.get("/login", function(request, response) {

    response.render("user/login");
    return;

});


router.post("/login", function(request, response, next) {

    let options = {successRedirect: "/",
                   failureRedirect: "/user/login",
                   failureFlash:    "Invalid username or password."};

    // authenticate user
    passport.authenticate("local", options) (request, response, next);
    return;

});


router.get("/logout", function(request, response) {

    request.logout();
    response.redirect("/");
    return;

});


router.get("/profile", function(request, response) {

    response.render("user/profile");
    return;

});


router.post("/profile", function(request, response) {

    // validation rules
    request.checkBody("first_name", "First name is required.").notEmpty();
    request.checkBody("last_name",  "Last name is required.").notEmpty();
    request.checkBody("email",      "Email is required.").notEmpty();
    request.checkBody("email",      "Please enter a valid email.").isEmail();

    // validate
    request.getValidationResult().then(function(errors) {

        // form errors
        if(!errors.isEmpty()) {

            errors.array().forEach(function(error) {
                request.flash("danger", error.msg);
            });

            response.redirect("/user/profile");
            return;
        }

        // create user
        let user = {};
        user.first_name = request.body.first_name;
        user.last_name  = request.body.last_name;
        user.email      = request.body.email;

        User.findByIdAndUpdate(request.user._id, user, function(err, doc) {

            // db create error
            if(err) {
                request.flash("danger", "We encountered an issue updating your user profile.");
                response.redirect("/user/profile");
                return;
            }

            // profile update success
            response.redirect("/user/profile");
            return;

        });
    });
});


router.get("/password", function(request, response) {

    response.render("user/password");
    return;

});


router.post("/password", function(request, response) {

    // validation rules
    request.checkBody("current_password", "Current password is required.").notEmpty();
    request.checkBody("new_password",     "New password is required.").notEmpty();
    request.checkBody("confirmation",     "Password confirmation is required.").notEmpty();
    request.checkBody("confirmation",     "Passwords must match.").equals(request.body.new_password);

    // validate
    request.getValidationResult().then(function(errors) {

        // form errors
        if(!errors.isEmpty()) {

            errors.array().forEach(function(error) {
                request.flash("danger", error.msg);
            });

            response.redirect("/user/password");
            return;
        }

        password.validate(request.body.current_password, request.user.password, function(err, result) {

            // password validate error
            if(err) {
                request.flash("danger", "We encountered an issue validating your password.");
                response.redirect("/user/password");
                return;
            }

            if(!result) {
                request.flash("danger", "Incorrect password.");
                response.redirect("/user/password");
                return;
            }

            password.encrypt(request.body.new_password, function(err, hash) {

                // password validate error
                if(err) {
                    request.flash("danger", "We encountered an issue encrypting your password.");
                    response.redirect("/user/password");
                    return;
                }

                // create user
                let user = {};
                user.password = hash;

                User.findByIdAndUpdate(request.user._id, user, function(err, doc) {

                    // db create error
                    if(err) {
                        request.flash("danger", "We encountered an issue updating your password.");
                        response.redirect("/user/profile");
                        return;
                    }

                    // password update success
                    response.redirect("/user/logout");
                    return;

                });
            });
        });
    });
});


router.get("/forgot", function(request, response) {

    response.render("user/forgot");
    return;

});


router.post("/forgot", function(request, response) {

    // validation rules
    request.checkBody("email", "Email is required.").notEmpty();
    request.checkBody("email", "Please enter a valid email.").isEmail();

    // identify user
    User.findOne({email: request.body.email}, function(err, user) {

        // db find error
        if(err) {
            request.flash("danger", "There was an issue searching the database.");
            response.redirect("/user/forgot");
            return;
        }

        // user not found
        if(!user) {
            request.flash("danger", "User with that email does not exist.");
            response.redirect("/user/forgot");
            return;
        }

        // generate reset token
        crypto.randomBytes(20, function(err, buffer) {

            // crypto error
            if(err) {
                request.flash("danger", "There was an issue generating your password reset token.");
                response.redirect("/user/forgot");
                return;
            }

            // convert bytes to string
            user.reset_token      = buffer.toString("hex");
            user.reset_expiration = Date.now() + 1800000;

            user.save(function(err, user) {

                // db save error
                if(err) {
                    request.flash("danger", "There was an issue saving the password reset token.");
                    response.redirect("/user/forgot");
                    return;
                }

                let transport_options = {host: process.env.SMTP_HOSTNAME,
                                         auth: {user: process.env.SMTP_USERNAME,
                                                pass: process.env.SMTP_PASSWORD}};

                // create email transport
                let transport = nodemailer.createTransport(transport_options);

                let link = "http://" + request.headers.host + "/user/reset/" + user.reset_token;

                let mail_options = {to:      user.email,
                                    from:    {name: "Node Web Application", address: process.env.SMTP_USERNAME},
                                    subject: "Password Reset",
                                    html:    `<p>Please click on this link to reset your password.</p> \
                                              <br> \
                                              <a href="${link}">${link}</a>`};

                transport.sendMail(mail_options, function(err, info) {

                    // email error
                    if(err) {
                        request.flash("danger", "We were unable to send your password reset email.");
                        response.redirect("/user/forgot");
                        return;
                    }

                    // user email success
                    response.redirect("/");
                    return;

                });
            });
        });
    });
});


router.get("/reset/:token", function(request, response) {

    User.findOne({reset_token: request.params.token}, function(err, user) {

        if(!user) {
            request.flash("danger", "Password reset token is invalid.");
            response.redirect("/user/forgot");
            return;
        }

        if(user.reset_expiration < Date.now()) {
            request.flash("danger", "Password reset token has expired.");
            response.redirect("/user/forgot");
            return;
        }

        // reset token success
        response.render("user/reset");
        return;

    });
});


router.post("/reset/:token", function(request, response) {

    User.findOne({reset_token: request.params.token}, function(err, user) {

        if(!user) {
            request.flash("danger", "Password reset token is invalid.");
            response.redirect("back");
            return;
        }

        if(user.reset_expiration < Date.now()) {
            request.flash("danger", "Password reset token has expired.");
            response.redirect("back");
            return;
        }

        // validation rules
        request.checkBody("password",     "New password is required.").notEmpty();
        request.checkBody("confirmation", "Password confirmation is required.").notEmpty();
        request.checkBody("confirmation", "Passwords must match.").equals(request.body.password);

        // validate
        request.getValidationResult().then(function(errors) {

            // form errors
            if(!errors.isEmpty()) {

                errors.array().forEach(function(error) {
                    request.flash("danger", error.msg);
                });

                response.redirect("back");
                return;
            }

            // update user
            user.password         = request.body.password;
            user.reset_token      = undefined;
            user.reset_expiration = undefined;

            user.save(function(err, user) {

                // db save error
                if(err) {
                    request.flash("danger", "There was an issue updating the password.");
                    response.redirect("back");
                    return;
                }

                // password reset success
                response.render("user/login");
                return;

            });
        });
    });
});


router.get("/register", function(request, response) {

    response.render("user/register");
    return;

});


router.post("/register", function(request, response) {

    // validation rules
    request.checkBody("first_name",   "First name is required.").notEmpty();
    request.checkBody("last_name",    "Last name is required.").notEmpty();
    request.checkBody("email",        "Email is required.").notEmpty();
    request.checkBody("email",        "Please enter a valid email.").isEmail();
    request.checkBody("password",     "Password is required.").notEmpty();
    request.checkBody("confirmation", "Password confirmation is required.").notEmpty();
    request.checkBody("confirmation", "Passwords must match.").equals(request.body.password);

    // validate
    request.getValidationResult().then(function(errors) {

        // form errors
        if(!errors.isEmpty()) {

            errors.array().forEach(function(error) {
                request.flash("danger", error.msg);
            });

            response.redirect("/user/register");
            return;
        }

        // create user
        let user = new User();
        user.first_name = request.body.first_name;
        user.last_name  = request.body.last_name;
        user.email      = request.body.email;
        user.password   = request.body.password;

        User.create(user, function(err, doc) {

            // db create error
            if(err) {
                request.flash("danger", `User with email '${user.email}' already exists.`);
                response.redirect("/user/register");
                return;
            }

            // user registration success
            response.redirect("/user/login");
            return;

        });
    });
});


// exports
module.exports = router;
