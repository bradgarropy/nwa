const Strategy = require("passport-local").Strategy;
const passport = require("passport");
const Password = require("./password");
const bcrypt   = require("bcryptjs");
const User     = require("../models/user");


let strat = new Strategy({usernameField: "email"}, function(email, password, done) {

    let query = {email: email};

    User.findOne(query, function(err, user) {

        if(err) {
            return done(err);
        }

        if(!user) {
            let message = "Incorrect email.";
            return done(null, false, {message: message});
        }

        Password.validate(password, user.password, function(err, result) {

            if(err) {
                console.log(err);
                throw err;
            }

            if(!result) {
                let message = "Incorrect password.";
                return done(null, false, {message: message});
            }

            return done(null, user);
        });

    });
});


passport.use(strat);


module.exports = passport;
