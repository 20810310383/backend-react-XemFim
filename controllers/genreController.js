const Genre = require("../models/genreModel");
const slugify = require("slugify");

// Cấu hình slug cho tiếng Việt
slugify.extend({
  đ: "d",
  Đ: "D",
  ă: "a",
  Ă: "A",
  â: "a",
  Â: "A",
  ê: "e",
  Ê: "E",
  ô: "o",
  Ô: "O",
  ơ: "o",
  Ơ: "O",
  ư: "u",
  Ư: "U",
});
//Thêm mới thể loại
exports.createGenre = async (req, res) => {
  try {
    const { name } = req.body;
    const slug = slugify(name, {
      lower: true, // chuyển thành chữ thường
      strict: true, // loại bỏ các ký tự đặc biệt
      locale: "vi", // sử dụng quy tắc tiếng Việt
    });

    const newGenre = new Genre({ name, slug });
    const savedGenre = await newGenre.save();

    res
      .status(201)
      .json({
        status: true,
        msg: "Genre created successfully",
        genre: savedGenre,
      });
  } catch (err) {
    res
      .status(500)
      .json({
        status: false,
        msg: "Failed to create genre",
        error: err.message,
      });
  }
};
//Lấy dữ liệu các thể loại
exports.getAllGenres = async (req, res) => {
  try {
    const genres = await Genre.find();
    res.json({ status: true, genres });
  } catch (err) {
    res
      .status(500)
      .json({
        status: false,
        msg: "Failed to fetch genres",
        error: err.message,
      });
  }
};

//Cập nhật thể loại
exports.updateGenre = async (req, res) => {
  try {
    const { name } = req.body;
    const slug = slugify(name, {
      lower: true,
      strict: true,
      locale: "vi",
    });

    const updatedGenre = await Genre.findByIdAndUpdate(
      req.params.id,
      { name, slug },
      { new: true }
    );

    if (!updatedGenre) {
      return res.status(404).json({ status: false, msg: "Genre not found" });
    }

    res.json({
      status: true,
      msg: "Genre updated successfully",
      genre: updatedGenre,
    });
  } catch (err) {
    res
      .status(500)
      .json({
        status: false,
        msg: "Failed to update genre",
        error: err.message,
      });
  }
};

//Xóa thể loại
exports.deleteGenre = async (req, res) => {
  try {
    const deletedGenre = await Genre.findByIdAndDelete(req.params.id);
    if (!deletedGenre) {
      return res.status(404).json({ status: false, msg: "Genre not found" });
    }
    res.json({ status: true, msg: "Genre deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({
        status: false,
        msg: "Failed to delete genre",
        error: err.message,
      });
  }
};
//Lấy slug thể loại
exports.getGenreBySlug = async (req, res) => {
  try {
    const genre = await Genre.findOne({ slug: req.params.slug });
    if (!genre) {
      return res.status(404).json({ status: false, msg: "Genre not found" });
    }
    res.json({ status: true, genre });
  } catch (err) {
    res
      .status(500)
      .json({
        status: false,
        msg: "Failed to fetch genre",
        error: err.message,
      });
  }
};
