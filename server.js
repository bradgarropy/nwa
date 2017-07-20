const bodyparser = require("body-parser");
const validator  = require("express-validator");
const mongoose   = require("mongoose");
const messages   = require("express-messages");
const passport   = require("./middleware/passport");
const express    = require("express");
const session    = require("express-session");
const cookie     = require("cookie-parser");
const logger     = require("./middleware/logger");
const flash      = require("connect-flash");
const index      = require("./routes/index");
const user       = require("./routes/user");


// create application
const app = express();


// create database
const mongo_dev = "mongodb://admin:password@ds159662.mlab.com:59662/node-web-app-template";
mongoose.connect(process.env.MONGODB_URI || mongo_dev, {useMongoClient: true});


// app settings
app.set("json spaces", 4);
app.set("views", "./views");
app.set("view engine", "pug");


// middleware
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));
app.use(logger.log);
app.use(cookie());
app.use(session({secret: "keyboard cat", resave: true, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(validator());
app.use(flash());


// user
app.use(function(request, response, next) {

    if(request.user) {
        response.locals.user = request.user;
    }
    else {
        response.locals.user = null;
    }

    // next middleware
    next();

});


// messages
app.use(function (request, response, next) {

    // set messages
    response.locals.messages = messages(request, response);

    // next  middleware
    next();

});


// index routes
app.use("/", index);

// user routes
app.use("/user", user);


// start application
const port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log("Server listening on port %s.", port);
});
