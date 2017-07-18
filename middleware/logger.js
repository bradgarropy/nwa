const moment = require("moment");


function log(request, response, next) {

    var user;
    if(request.user) {
        user = request.user.email;
    }
    else {
        user = "none";
    }

    let date = moment().format("MM-DD-YYYY hh:mm:ss a");
    let message = `[${date}] (${user}) "${request.method} ${request.url}" ${JSON.stringify(request.body)}`;

    // log request
    console.log(message);

    next();
}


// exports
exports.log = log;
