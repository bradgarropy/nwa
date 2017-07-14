const express = require("express");
const Weight  = require("../models/weight");


// create router
const router = express.Router();


// http get
router.get("/", function(request, response) {

    Weight.read(function(err, weights) {

        // check errors
        if(err) {
            console.log(err);
            throw err;
        }

        // carry on
        else {
            // send response
            response.render("index", {weights: weights});
        }
    });
});


// exports
module.exports = router;
