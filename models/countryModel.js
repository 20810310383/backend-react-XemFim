const mongoose = require("mongoose");
//Dữ liệu Mongo cho quốc gia
const countrySchema = new mongoose.Schema({
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

module.exports = mongoose.model("Country", countrySchema);
