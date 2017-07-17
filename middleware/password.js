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


// exports
exports.encrypt = encrypt;
