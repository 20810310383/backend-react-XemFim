const express = require("express");
const router = express.Router();
const genreController = require("../controllers/genreController");
const authMiddleware = require("../middlewares/authmiddleware");

// Tạo thể loại mới
router.post(
  "/",
  authMiddleware.authenticate,
  authMiddleware.authorizeAdmin,
  genreController.createGenre
);

// Lấy danh sách tất cả thể loại
router.get("/", genreController.getAllGenres);

//Lay theo slug
router.get("/slug/:slug", genreController.getGenreBySlug);

// Cập nhật thông tin thể loại
router.put(
  "/:id",
  authMiddleware.authenticate,
  authMiddleware.authorizeAdmin,
  genreController.updateGenre
);

// Xóa một thể loại
router.delete(
  "/:id",
  authMiddleware.authenticate,
  authMiddleware.authorizeAdmin,
  genreController.deleteGenre
);

module.exports = router;
