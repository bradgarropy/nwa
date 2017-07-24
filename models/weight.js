const mongoose = require("mongoose");


// define schema
var weightSchema = mongoose.Schema({
    user_id: { type: String, required: true, unique: false },
    date:    { type: Date,   required: true, unique: true  },
    weight:  { type: Number, required: true, unique: false }
});


// create model
var Weight = mongoose.model("Weight", weightSchema);


// exports
module.exports = Weight;
