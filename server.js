const bodyparser = require("body-parser");
const validator  = require("express-validator");
const mongoose   = require("mongoose");
const passport   = require("./middleware/passport");
const express    = require("express");
const session    = require("express-session");
const logger     = require("./middleware/logger");
const flash      = require("connect-flash");
const index      = require("./routes/index");
const user       = require("./routes/user");


// create application
const app = express();


// create database
mongoose.connect("mongodb://admin:password@ds159662.mlab.com:59662/node-web-app-template", {useMongoClient: true});


// app settings
app.set("json spaces", 4);
app.set("views", "./views");
app.set("view engine", "pug");


// middleware
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));
app.use(validator());
app.use(session({secret: "keyboard cat", resave: true, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(logger.log);


// index routes
app.use("/", index);

// user routes
app.use("/user", user);


// start application
const port = 3000;
app.listen(port, function() {
    console.log("Server listening on port %s.", port);
});
