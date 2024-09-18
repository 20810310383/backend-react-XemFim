const mongoose = require("mongoose");
//Dữ liệu Mongo cho thể loại phim
const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model("Genre", genreSchema);
