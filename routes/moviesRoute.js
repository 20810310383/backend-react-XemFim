const express = require("express");
const router = express.Router();
const movieController = require("../controllers/movieController");
const authMiddleware = require("../middlewares/authmiddleware");

//Routes lấy dữ liệu từ API ở trang Admin thêm phim từ API
router.get(
  "/fetch-movies",
  authMiddleware.authenticate,
  authMiddleware.authorizeAdmin,
  movieController.fetchAndSaveMovies
);

//Route thêm mới 1 bộ phim
router.post(
  "/",
  authMiddleware.authenticate,
  authMiddleware.authorizeAdmin,
  movieController.addMovie
);
//route lấy dữ liệu tất cả bộ phim
router.get("/", movieController.getAllMovies);
//Route lấy dữ liệu bộ phim theo slug
router.get("/duongdan/:slug", movieController.getMovieBySlug);
//Route lấy dữ liệu bộ phim theo thể loại
router.get("/category/:category", movieController.getMoviesByCategory);
//Route lấy dữ liệu bộ phim theo quốc gia
router.get("/country/:country", movieController.getMovieByCountry);
//Route lấy dữ liệu phim lẻ
router.get("/single", movieController.getSingleMovies);
//Route lấy dữ liệu phim bộ
router.get("/series", movieController.getSeriesMovies);
//Route lấy dữ liệu phim đề xuất
router.get("/suggested", movieController.getSuggestionMovies);
//Route tìm kiếm phim
router.get("/search", movieController.searchMovies);
//Route lấy dữ liệu phim ngẫu nhiên
router.get("/random", movieController.getRandomMovie);
//Route thêm yeu thich 1 bộ phim
router.post(
  "/favorite/:id",
  authMiddleware.authenticate,
  movieController.toggleFavorite
);
//Route lấy dữ liệu phim yêu thích
router.get(
  "/favorites",
  authMiddleware.authenticate,
  movieController.getFavorites
);
//Route kiểm tra trạng thái yêu thích
router.get(
  "/favorite/:id",
  authMiddleware.authenticate,
  movieController.checkFavoriteStatus
);

//Cập nhật phim
router.put(
  "/:movieId",
  authMiddleware.authenticate,
  authMiddleware.authorizeAdmin,
  movieController.updateMovie
);
//Xóa Phim
router.delete(
  "/:movieId",
  authMiddleware.authenticate,
  authMiddleware.authorizeAdmin,
  movieController.deleteMovie
);

//Thêm tập vào bộ phim
router.post(
  "/:movieId/episodes",
  authMiddleware.authenticate,
  authMiddleware.authorizeAdmin,
  movieController.addEpisodeToMovie
);
//Cập nhật tập phim
router.put(
  "/:movieId/episodes/:episodeId",
  authMiddleware.authenticate,
  authMiddleware.authorizeAdmin,
  movieController.updateEpisode
);
//Xóa tập
router.delete(
  "/:movieId/episodes/:episodeId",
  authMiddleware.authenticate,
  authMiddleware.authorizeAdmin,
  movieController.deleteEpisode
);

module.exports = router;
