const express = require("express");
const router = express.Router();
const countryController = require("../controllers/countryController");
const authMiddleware = require("../middlewares/authmiddleware");

// Tạo quốc gia mới
router.post(
  "/",
  authMiddleware.authenticate,
  authMiddleware.authorizeAdmin,
  countryController.createCountry
);

// Lấy danh sách tất cả quốc gia
router.get("/", countryController.getAllCountries);

// Lấy quốc gia theo slug
router.get("/:slug", countryController.getCountryBySlug);

// Cập nhật thông tin quốc gia
router.put(
  "/:id",
  authMiddleware.authenticate,
  authMiddleware.authorizeAdmin,
  countryController.updateCountry
);

// Xóa một quốc gia
router.delete(
  "/:id",
  authMiddleware.authenticate,
  authMiddleware.authorizeAdmin,
  countryController.deleteCountry
);

module.exports = router;
