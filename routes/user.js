const validator = require("express-validator");
const passport  = require("../middleware/passport");
const password  = require("../middleware/password");
const express   = require("express");
const User      = require("../models/user");


// create router
const router = express.Router();


router.get("/login", function(request, response) {

    response.render("user/login");
    return;

});


router.post("/login", passport.authenticate("local"), function(request, response) {

    response.redirect("/weight");
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
            response.render("user/profile", {errors: errors.array()});
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
                let errors = [{msg: "We encountered an issue updating your user profile."}];
                response.render("user/profile", {errors: errors});
                return;
            }

            // user registration success
            response.redirect("/user/profile");
            return;

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
            response.render("user/register", {errors: errors.array()});
            return;
        }

        // hash password
        password.encrypt(request.body.password, function(err, hash) {

            // encryption error
            if(err) {
                console.log(err);
                throw err;
            }

            // create user
            let user = new User();
            user.first_name = request.body.first_name;
            user.last_name  = request.body.last_name;
            user.email      = request.body.email;
            user.password   = hash;

            User.create(user, function(err, doc) {

                // db create error
                if(err) {
                    let errors = [{msg: `User with email '${user.email}' already exists.`}];
                    response.render("user/register", {errors: errors});
                    return;
                }

                // user registration success
                response.redirect("/user/login");
                return;

            });
        });
    });
});


// exports
module.exports = router;
