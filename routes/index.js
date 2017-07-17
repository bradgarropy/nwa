const express = require("express");


// create router
const router = express.Router();


// http get
router.get("/", function(request, response) {

    // send response
    response.render("index");

});


// exports
module.exports = router;
