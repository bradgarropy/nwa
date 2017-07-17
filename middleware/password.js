const bcrypt = require("bcryptjs");


function encrypt(password, callback) {

    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {

            if(err) {
                console.log(err);
                throw err;
            }
            else {
                callback(err, hash);
            }
        });
    });
}


function validate(password, hash, callback) {

    bcrypt.compare(password, hash, function(err, result) {

        if(err) {
            console.log(err);
            throw err;
        }
        else {
            callback(err, result);
        }
    });
}


// exports
exports.validate = validate;
exports.encrypt  = encrypt;
