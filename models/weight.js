const mongoose = require("mongoose");


// define schema
var weightSchema = mongoose.Schema({
    date:   Date,
    weight: Number
});


// create model
var Weight = mongoose.model("Weight", weightSchema);


function create(weight, callback) {

    Weight.create(weight, callback);
}


function read(callback) {

    Weight.find(callback);
}


function update(date, weight, callback) {

    let query   = {date: date};
    let update  = {weight: weight};
    let options = {new: true};

    Weight.findOneAndUpdate(query, update, options, callback);
}


function destroy(date, callback) {

    let query = {date: date};

    Weight.findOneAndRemove(query, callback);
}


// exports
exports.create  = create;
exports.read    = read;
exports.update  = update;
exports.destroy = destroy;
