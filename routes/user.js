const express = require("express");
const User  = require("../models/user");


// create router
const router = express.Router();


// http get
router.get("/register", function(request, response) {

    // send response
    response.render("register");

});


// http post
router.post("/register", function(request, response) {

    let user = request.body;

    User.create(user, function(err, user) {

        if(err) {

            // descriptive message
            let message = `User with email '${request.body.email}' already exists.`;

            // send response
            response.status(409);
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
