const moment = require("moment");


function log(request, response, next) {

    let date = moment().format("MM-DD-YYYY hh:mm:ss a");
    let message = `[${date}] "${request.method} ${request.url}" ${JSON.stringify(request.body)}`;

    // log request
    console.log(message);

    next();
}


// exports
exports.log = log;
