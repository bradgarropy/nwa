const mongoose = require("mongoose");
const password = require("../middleware/password");


// define schema
var userSchema = mongoose.Schema({
    first_name: { type: String, required: true, unique: false },
    last_name:  { type: String, required: true, unique: false },
    email:      { type: String, required: true, unique: true  },
    password:   { type: String, required: true, unique: false }
});


// create model
var User = mongoose.model("User", userSchema);


function create(user, callback) {

    User.create(user, callback);
}


function read(callback) {

    User.find(callback);
}


function destroy(id, callback) {

    User.findByIdAndRemove(id, callback);
}


// exports
exports.create  = create;
exports.read    = read;
exports.destroy = destroy;
