const mongoose = require("mongoose");
const Episode = require("./episodeModel");
//Dữ liệu Mongo cho phim
const movieSchema = new mongoose.Schema({
  name: String,
  origin_name: String,
  content: String,
  type: String,
  status: String,
  thumb_url: String,
  trailer_url: String,
  time: String,
  episode_current: String,
  episode_total: String,
  quality: String,
  lang: String,
  notify: String,
  showtimes: String,
  slug: String,
  year: Number,
  view: Number,
  actor: [String],
  director: [String],
  category: [
    {
      id: String,
      name: String,
      slug: String,
    },
  ],
  country: [
    {
      id: String,
      name: String,
      slug: String,
    },
  ],
  is_copyright: Boolean,
  chieurap: Boolean,
  poster_url: String,
  sub_docquyen: Boolean,
  episodes: [Episode.schema],
  created: {
    time: { type: Date, default: Date.now },
  },
  modified: {
    time: { type: Date, default: Date.now },
  },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }], // Tham chiếu đến CommentSchema
  ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Rating" }], // Tham chiếu đến RatingSchema
});

module.exports = mongoose.model("Movie", movieSchema);
