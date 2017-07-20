const express = require("express");


// create router
const router = express.Router();


router.get("/", function(request, response) {

    response.render("index");
    return;

});


// exports
module.exports = router;
