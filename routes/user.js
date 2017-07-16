const express = require("express");
const User  = require("../models/user");


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


// http get
router.get("/register", function(request, response) {

    // send response
    response.render("register");

});


// http post
router.post("/register", function(request, response) {

    let user = request.body;

    User.create(user, function(err, doc) {

        if(err) {

            // descriptive message
            let message = `User with email '${user.email}' already exists.`;

            // send response
            response.status(409);
            response.json( {message: message, error: err} );
        }
        else {
            // send response
            response.json(doc);
        }
    });
});


// http delete
router.delete("/remove/:id", function(request, response) {

    let id = request.params.id;

    User.destroy(id, function(err, user) {

        if(err) {
            console.log(err);
            throw err;
        }
        else if (user === null) {

            // descriptive message
            let message = `User with ID '${id}' does not exist.`;

            console.log(message);

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
