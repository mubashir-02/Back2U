const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    first: String,
    last: String,
    email: String,
});

module.exports = mongoose.model("user",userSchema);