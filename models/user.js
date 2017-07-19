const mongoose = require("mongoose");


// define schema
var userSchema = mongoose.Schema({
    first_name: { type: String, required: true, unique: false },
    last_name:  { type: String, required: true, unique: false },
    email:      { type: String, required: true, unique: true  },
    password:   { type: String, required: true, unique: false }
});


// create model
var User = mongoose.model("User", userSchema);


function destroy(id, callback) {

    User.findByIdAndRemove(id, callback);
}


// exports
module.exports = User;
