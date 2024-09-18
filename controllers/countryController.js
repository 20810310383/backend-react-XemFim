const Country = require("../models/countryModel");
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
//thêm mới quốc gia
exports.createCountry = async (req, res) => {
  try {
    const { name } = req.body;
    const slug = slugify(name, { lower: true, strict: true, locale: "vi" });

    const newCountry = new Country({ name, slug });
    const savedCountry = await newCountry.save();

    res
      .status(201)
      .json({
        status: true,
        msg: "Country created successfully",
        country: savedCountry,
      });
  } catch (err) {
    res
      .status(500)
      .json({
        status: false,
        msg: "Failed to create country",
        error: err.message,
      });
  }
};
//Lấy tất cả dữ liệu quốc gia
exports.getAllCountries = async (req, res) => {
  try {
    const countries = await Country.find();
    res.json({ status: true, countries });
  } catch (err) {
    res
      .status(500)
      .json({
        status: false,
        msg: "Failed to fetch countries",
        error: err.message,
      });
  }
};
//Cập nhật quốc gia
exports.updateCountry = async (req, res) => {
  try {
    const { name } = req.body;
    const slug = slugify(name, { lower: true, strict: true, locale: "vi" });

    const updatedCountry = await Country.findByIdAndUpdate(
      req.params.id,
      { name, slug },
      { new: true }
    );

    if (!updatedCountry) {
      return res.status(404).json({ status: false, msg: "Country not found" });
    }

    res.json({
      status: true,
      msg: "Country updated successfully",
      country: updatedCountry,
    });
  } catch (err) {
    res
      .status(500)
      .json({
        status: false,
        msg: "Failed to update country",
        error: err.message,
      });
  }
};
//Xóa quốc gia
exports.deleteCountry = async (req, res) => {
  try {
    const deletedCountry = await Country.findByIdAndDelete(req.params.id);
    if (!deletedCountry) {
      return res.status(404).json({ status: false, msg: "Country not found" });
    }
    res.json({ status: true, msg: "Country deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({
        status: false,
        msg: "Failed to delete country",
        error: err.message,
      });
  }
};
//Lấy quốc gia theo slug
exports.getCountryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const country = await Country.findOne({ slug: slug.toLowerCase() });
    if (!country) {
      return res.status(404).json({ message: "Không tìm thấy quốc gia" });
    }

    res.json({ country });
  } catch (error) {
    console.error("Error in getCountryBySlug:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
