const bcrypt = require("bcryptjs");


function encrypt(password, callback) {

    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {

            if(err) {
                console.log(err);
                throw err;
            }

            callback(err, hash);
            return;

        });
    });
}


function validate(password, hash, callback) {

    bcrypt.compare(password, hash, function(err, result) {

        if(err) {
            console.log(err);
            throw err;
        }

        callback(err, result);
        return;

    });
}


// exports
exports.validate = validate;
exports.encrypt  = encrypt;
