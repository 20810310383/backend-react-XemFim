// controllers/movieController.js
const { populate } = require("../models/episodeModel");
const Movie = require("../models/movieModel");
const axios = require("axios");
const Favorite = require("../models/Favorite");
const Genre = require("../models/genreModel");

// Thêm một phim
exports.addMovie = async (req, res) => {
  try {
    console.log("Received movie data:", req.body); // Log dữ liệu request để kiểm tra

    const newMovie = new Movie(req.body);
    await newMovie.save();

    res.status(201).json(newMovie);
  } catch (error) {
    console.error("Error adding movie:", error); // Log lỗi
    res
      .status(500)
      .json({ msg: "Internal Server Error", error: error.message });
  }
};
//Cập nhật Phim
exports.updateMovie = async (req, res) => {
  const movieId = req.params.movieId;
  const movieData = req.body;

  console.log("Received movieId:", movieId);
  console.log("Received movieData:", movieData);

  if (!movieData) {
    return res
      .status(400)
      .json({ status: false, error: "Movie data is undefined" });
  }

  try {
    if (movieData.category && movieData.category.length > 0) {
      const categoryIds = movieData.category.map((genre) => genre.id);
      console.log("Category IDs:", categoryIds);

      const genres = await Genre.find({
        _id: { $in: categoryIds },
      });

      movieData.category = genres.map((genre) => ({
        id: genre._id.toString(),
        name: genre.name,
        slug: genre.slug,
      }));
    }

    const updatedMovie = await Movie.findByIdAndUpdate(movieId, movieData, {
      new: true,
    });

    if (!updatedMovie) {
      return res.status(404).json({ status: false, error: "Movie not found" });
    }

    res.json({ status: true, data: updatedMovie });
  } catch (error) {
    console.error("Error updating movie:", error);
    console.error("Error details:", error.stack); // Log thêm chi tiết lỗi
    res.status(500).json({
      status: false,
      error: "An error occurred while updating the movie",
    });
  }
};

//Thêm tập phim
exports.addEpisodeToMovie = async (req, res) => {
  const movieId = req.params.movieId;
  const episodeData = req.body.episodes?.server_data || req.body.episode;

  try {
    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({ status: false, msg: "Movie not found" });
    }

    let vietsub1Server = movie.episodes.find(
      (ep) => ep.server_name === "Vietsub #1"
    );

    if (vietsub1Server) {
      // Nếu server đã tồn tại
      if (
        vietsub1Server.server_data.length === 1 &&
        vietsub1Server.server_data[0] === null
      ) {
        // Nếu server_data chỉ chứa null, thay thế nó bằng mảng mới
        vietsub1Server.server_data = Array.isArray(episodeData)
          ? episodeData
          : [episodeData];
      } else {
        // Nếu server_data không phải null, thêm episode(s) mới vào mảng
        vietsub1Server.server_data =
          vietsub1Server.server_data.concat(episodeData);
      }
    } else {
      // Nếu server chưa tồn tại, tạo mới
      movie.episodes.push({
        server_name: "Vietsub #1",
        server_data: Array.isArray(episodeData) ? episodeData : [episodeData],
      });
    }

    // Sắp xếp episodes theo thứ tự tăng dần của số tập
    if (vietsub1Server && Array.isArray(vietsub1Server.server_data)) {
      vietsub1Server.server_data.sort(
        (a, b) => parseInt(a.name) - parseInt(b.name)
      );
    }

    // Đánh dấu trường episodes là đã sửa đổi để Mongoose cập nhật nó
    movie.markModified("episodes");

    // Lưu thay đổi
    const updatedMovie = await movie.save();

    res.json({
      status: true,
      msg: "Episode(s) added successfully",
      movie: updatedMovie,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      msg: "Failed to add episode(s)",
      error: err.message,
    });
  }
};
// Cập nhật tập phim
exports.updateEpisode = async (req, res) => {
  const { movieId, episodeId } = req.params;
  const updatedEpisodeData = req.body.episode;

  try {
    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({ status: false, msg: "Movie not found" });
    }

    const vietsub1Server = movie.episodes.find(
      (ep) => ep.server_name === "Vietsub #1"
    );

    if (!vietsub1Server) {
      return res.status(404).json({ status: false, msg: "Server not found" });
    }

    const episodeIndex = vietsub1Server.server_data.findIndex(
      (ep) => ep._id.toString() === episodeId
    );

    if (episodeIndex === -1) {
      return res.status(404).json({ status: false, msg: "Episode not found" });
    }

    // Cập nhật thông tin tập phim
    vietsub1Server.server_data[episodeIndex] = {
      ...vietsub1Server.server_data[episodeIndex],
      ...updatedEpisodeData,
    };

    // Sắp xếp lại các tập theo thứ tự tăng dần
    vietsub1Server.server_data.sort(
      (a, b) => parseInt(a.name) - parseInt(b.name)
    );

    movie.markModified("episodes");
    await movie.save();

    res.json({
      status: true,
      msg: "Episode updated successfully",
      episode: vietsub1Server.server_data[episodeIndex],
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      msg: "Failed to update episode",
      error: err.message,
    });
  }
};
//Xóa tập Phim
exports.deleteEpisode = async (req, res) => {
  const { movieId, episodeId } = req.params;

  try {
    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({ status: false, msg: "Movie not found" });
    }

    const vietsub1Server = movie.episodes.find(
      (ep) => ep.server_name === "Vietsub #1"
    );

    if (!vietsub1Server) {
      return res.status(404).json({ status: false, msg: "Server not found" });
    }

    const episodeIndex = vietsub1Server.server_data.findIndex(
      (ep) => ep._id.toString() === episodeId
    );

    if (episodeIndex === -1) {
      return res.status(404).json({ status: false, msg: "Episode not found" });
    }

    // Xóa tập phim
    vietsub1Server.server_data.splice(episodeIndex, 1);

    // Nếu không còn tập nào, đặt server_data về [null]
    if (vietsub1Server.server_data.length === 0) {
      vietsub1Server.server_data = [null];
    }

    movie.markModified("episodes");
    await movie.save();

    res.json({
      status: true,
      msg: "Episode deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      msg: "Failed to delete episode",
      error: err.message,
    });
  }
};
//Lấy tất cả dữ liệu Phim
exports.getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find({});
    res.json({ status: true, movies });
  } catch (err) {
    res
      .status(500)
      .json({ status: false, msg: "Failed to get movies", error: err.message });
  }
};
//Lấy dũ liệu phim theoID
exports.getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);
    res.json({ status: true, movie });
  } catch (err) {
    res
      .status(500)
      .json({ status: false, msg: "Failed to get movie", error: err.message });
  }
};
//Xóa Phim
exports.deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.movieId);
    if (!movie) {
      return res.status(404).json({ status: false, msg: "Movie not found" });
    }
    res.json({ status: true, msg: "Movie deleted successfully" });
  } catch (err) {
    res.status(500).json({
      status: false,
      msg: "Failed to delete movie",
      error: err.message,
    });
  }
};
//Lấy dữ  liệu Phim theo Slug
exports.getMovieBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const movie = await Movie.findOne({ slug });

    if (!movie) {
      return res.status(404).json({ status: false, msg: "Movie not found" });
    }
    res.json({ status: true, movie });
  } catch (err) {
    res
      .status(500)
      .json({ status: false, msg: "Failed to get movie", error: err.message });
  }
};
//Lấy Phim tù API
exports.fetchAndSaveMovies = async (req, res) => {
  try {
    for (let page = 129; page <= 130; page++) {
      const response = await axios.get(
        `https://ophim1.com/danh-sach/phim-moi-cap-nhat?page=${page}`
      );
      const movies = response.data.items;

      for (const movieData of movies) {
        // Lấy thông tin chi tiết của phim
        const detailResponse = await axios.get(
          `https://ophim1.com/phim/${movieData.slug}`
        );
        const movieDetail = detailResponse.data.movie;
        const episodes = detailResponse.data.episodes;

        // Chuẩn bị dữ liệu phim
        const movie = {
          name: movieDetail.name,
          origin_name: movieDetail.origin_name,
          content: movieDetail.content,
          type: movieDetail.type,
          status: movieDetail.status,
          thumb_url: movieDetail.thumb_url,
          poster_url: movieDetail.poster_url,
          year: movieDetail.year,
          time: movieDetail.time,
          episode_current: movieDetail.episode_current,
          episode_total: movieDetail.episode_total,
          quality: movieDetail.quality,
          lang: movieDetail.lang,
          slug: movieDetail.slug,
          actor: movieDetail.actor,
          director: movieDetail.director,
          category: movieDetail.category,
          country: movieDetail.country,
          episodes: episodes,
        };

        // Kiểm tra xem phim đã tồn tại chưa
        const existingMovie = await Movie.findOne({ slug: movie.slug });

        if (existingMovie) {
          // Nếu phim đã tồn tại, cập nhật thông tin
          await Movie.findOneAndUpdate({ slug: movie.slug }, movie, {
            new: true,
          });
        } else {
          // Nếu phim chưa tồn tại, tạo mới
          const newMovie = new Movie(movie);
          await newMovie.save();
        }
      }

      console.log(`Completed processing page ${page}`);
    }

    res.json({
      status: true,
      msg: "Movies fetched and saved successfully for pages ",
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      msg: "Failed to fetch and save movies",
      error: err.message,
    });
  }
};
// Lấy dữ liệu phim theo thể loại
exports.getMoviesByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    // Sử dụng category.slug để truy vấn mảng category
    const movies = await Movie.find({ "category.slug": category }).select(
      "name thumb_url slug year "
    );
    res.json({ status: true, movies });
  } catch (err) {
    res
      .status(500)
      .json({ status: false, msg: "Failed to get movies", error: err.message });
  }
};
// Lỗi dữ liệu phim ngẫu nhiên
exports.getRandomMovie = async (req, res) => {
  try {
    // Đếm tổng số phim trong cơ sở dữ liệu
    const count = await Movie.countDocuments();

    if (count === 0) {
      return res
        .status(404)
        .json({ status: false, msg: "Không có phim nào trong database" });
    }

    // Chọn ngẫu nhiên một vị trí trong danh sách phim
    const random = Math.floor(Math.random() * count);
    // Lấy phim từ vị trí đã chọn
    const randomMovie = await Movie.findOne()
      .skip(random)
      .select("name thumb_url id age_rating slug");

    if (!randomMovie) {
      return res
        .status(404)
        .json({ status: false, msg: "Không tìm thấy phim" });
    }

    res.json({ status: true, movie: randomMovie });
  } catch (error) {
    console.error("Lỗi khi lấy phim ngẫu nhiên:", error);
    res.status(500).json({ error: error.message });
  }
};
// Lỗi dữ liệu phim theo quốc gia
exports.getMovieByCountry = async (req, res) => {
  const { country } = req.params;
  try {
    const movies = await Movie.find({ "country.slug": country }).select(
      "name thumb_url slug year "
    );
    res.json({ status: true, movies });
  } catch (err) {
    res
      .status(500)
      .json({ status: false, msg: "Failed to get movies", error: err.message });
  }
};
// Lỗi dữ liệu phim lẻ
exports.getSingleMovies = async (req, res) => {
  try {
    const singleMovies = await Movie.find({ type: "single" }).sort({
      createdAt: -1,
    });
    res.json(singleMovies);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching single movies", error: error.message });
  }
};
// Lỗi dữ liệu phim bộ
exports.getSeriesMovies = async (req, res) => {
  try {
    const seriesMovies = await Movie.find({ type: "series" }).sort({
      createdAt: -1,
    });
    res.json(seriesMovies);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching series movies", error: error.message });
  }
};
// Lỗi dữ liệu phim đề xuất
exports.getSuggestionMovies = async (req, res) => {
  try {
    // Đếm tổng số phim trong cơ sở dữ liệu
    const count = await Movie.countDocuments();

    if (count === 0) {
      return res
        .status(404)
        .json({ status: false, msg: "Không có phim nào trong database" });
    }

    // Chọn 10 phim ngẫu nhiên
    const randomMovies = await Movie.aggregate([
      { $sample: { size: 6 } }, // Chọn ngẫu nhiên 10 phim
    ]);

    res.json({ status: true, movies: randomMovies });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error fetching some suggestion movies",
      error: error.message,
    });
  }
};
//Tìm Kiếm Phim
exports.searchMovies = async (req, res) => {
  const { term, genre, country, year, type } = req.query;

  try {
    let query = {};

    if (term) {
      query.name = { $regex: term, $options: "i" };
    }

    if (genre) {
      query["category.slug"] = genre;
    }

    if (country) {
      query["country.slug"] = country;
    }

    if (year) {
      query.year = parseInt(year);
    }

    if (type) {
      query.type = type;
    }

    const movies = await Movie.find(query).select("name thumb_url slug year");
    res.json({ movies }); // Bọc phim trong một đối tượng với thuộc tính `movies`
  } catch (err) {
    res.status(500).json({
      status: false,
      msg: "Failed to search movies",
      error: err.message,
    });
  }
};
//Xử Lý Yêu thích phim
exports.toggleFavorite = async (req, res) => {
  try {
    const movieId = req.params.id;
    const userId = req.user._id;

    const existingFavorite = await Favorite.findOne({
      user: userId,
      movie: movieId,
    });

    if (existingFavorite) {
      await Favorite.findByIdAndDelete(existingFavorite._id);
      res.json({ isFavorite: false });
    } else {
      await Favorite.create({ user: userId, movie: movieId });
      res.json({ isFavorite: true });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error toggling favorite", error: error.message });
  }
};
//Lấy dữ liệu phim Yêu thích
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user._id;
    const favorites = await Favorite.find({ user: userId })
      .populate("movie")
      .sort({ createdAt: -1 });
    res.json({ favorites: favorites.map((f) => f.movie) });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching favorites", error: error.message });
  }
};
//Kiểm tra trạng thái Yêu thích
exports.checkFavoriteStatus = async (req, res) => {
  try {
    const movieId = req.params.id;
    const userId = req.user._id;
    const existingFavorite = await Favorite.findOne({
      user: userId,
      movie: movieId,
    });

    res.json({ isFavorite: !!existingFavorite });
  } catch (error) {
    res.status(500).json({
      message: "Error checking favorite status",
      error: error.message,
    });
  }
};
