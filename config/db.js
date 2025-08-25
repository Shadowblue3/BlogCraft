const mongoose = require('mongoose');
require('dotenv').config();

const connection = mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log("connected to mongodb");
})

module.exports = connection;