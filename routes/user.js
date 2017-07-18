const validator = require("express-validator");
const passport  = require("../middleware/passport");
const password  = require("../middleware/password");
const express   = require("express");
const User      = require("../models/user");


// create router
const router = express.Router();


// http get
router.get("/", function(request, response) {

    User.read(function(err, users) {

        if(err) {
            console.log(err);
            throw err;
        }
        else {
            // send response
            response.json(users);
        }
    });

});


// http get
router.get("/login", function(request, response) {

    // send response
    response.render("login");

});


// http post
router.post("/login", passport.authenticate("local"), function(request, response) {

    // send response
    response.render("success");

});


// http get
router.get("/register", function(request, response) {

    // send response
    response.render("register");

});


// http post
router.post("/register", function(request, response) {

    // validate
    request.checkBody("first_name",   "First name is required.").notEmpty();
    request.checkBody("last_name",    "Last name is required.").notEmpty();
    request.checkBody("email",        "Email is required.").notEmpty();
    request.checkBody("email",        "Please enter a valid email.").isEmail();
    request.checkBody("password",     "Password is required.").notEmpty();
    request.checkBody("confirmation", "Password confirmation is required.").notEmpty();
    request.checkBody("confirmation", "Passwords must match.").equals(request.body.password);

    request.getValidationResult().then(function(errors) {

        // form errors
        if(!errors.isEmpty()) {
            response.render("register", {errors: errors.array()});
        }
        // hash password
        else {

            password.encrypt(request.body.password, function(err, hash) {

                // encryption error
                if(err) {
                    console.log(err);
                    throw err;
                }
                // create user
                else {
                    request.body.password = hash;

                    User.create(request.body, function(err, doc) {

                        // db create error
                        if(err) {
                            let errors = [{msg: `User with email '${request.body.email}' already exists.`}];
                            response.render("register", {errors: errors});
                        }
                        // user registration success
                        else {
                            response.redirect("login");
                        }
                    });
                }
            });
        }
    });
});


// http delete
router.delete("/remove/:id", function(request, response) {

    let id = request.params.id;

    User.findByIdAndRemove(id, function(err, user) {

        if(err) {
            console.log(err);
            throw err;
        }
        else if (user === null) {

            // descriptive message
            let message = `User with ID '${id}' does not exist.`;

            // send response
            response.status(404);
            response.json( {message: message, error: err} );
        }
        else {
            // send response
            response.json(user);
        }
    });
});


// exports
module.exports = router;
