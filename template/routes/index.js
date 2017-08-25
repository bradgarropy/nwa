const express = require('express');


// create router
const router = express.Router();


router.get('/', (request, response) => {

    response.render('index');


});


// exports
module.exports = router;
