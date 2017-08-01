const mongoose = require("mongoose");
const password = require("../middleware/password");


// define schema
var userSchema = mongoose.Schema({
    first_name:       { type: String, required: true,  unique: false },
    last_name:        { type: String, required: true,  unique: false },
    email:            { type: String, required: true,  unique: true  },
    password:         { type: String, required: true,  unique: false },
    reset_token:      { type: String, required: false, unique: false },
    reset_expiration: { type: Date,   required: false, unique: false }
});

// save middleware
userSchema.pre("save", function(next) {

    let user = this;

    // hash password
    password.encrypt(user.password, function(err, hash) {

        // encryption error
        if(err) {
            console.log(err);
            throw err;
        }

        user.password = hash;

        // next middleware
        next();

    });
});


// create model
var User = mongoose.model("User", userSchema);


// exports
module.exports = User;
