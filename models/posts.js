const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: String,
  category: String,
  content: String,
  tags: String,
  imageUrl: String,
  imagePublicId: String,
  userEmail: String,
  Author: String,
  views: Number,
});

const postModel = mongoose.model('post', postSchema)
module.exports = postModel;