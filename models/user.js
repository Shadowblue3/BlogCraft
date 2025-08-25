const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
    fullName: String,
    email: String,
    password: String,
    confirmPassword: String
});

const userModel = mongoose.model('user', userSchema)
module.exports = userModel;
