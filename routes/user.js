const validator = require("express-validator");
const passport  = require("../middleware/passport");
const password  = require("../middleware/password");
const express   = require("express");
const User      = require("../models/user");


// create router
const router = express.Router();


router.get("/login", function(request, response) {

    response.render("login");
    return;

});


router.post("/login", passport.authenticate("local"), function(request, response) {

    response.redirect("/");
    return;

});


router.get("/logout", function(request, response) {

    request.logout();
    response.redirect("/");
    return;

});


router.get("/register", function(request, response) {

    response.render("register");
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
            response.render("register", {errors: errors.array()});
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
            request.body.password = hash;

            User.create(request.body, function(err, doc) {

                // db create error
                if(err) {
                    let errors = [{msg: `User with email '${request.body.email}' already exists.`}];
                    response.render("register", {errors: errors});
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
