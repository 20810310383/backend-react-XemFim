// Import các module cần thiết
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const moviesRouter = require("./routes/moviesRoute");
const genreRouter = require("./routes/genreRoute");
const countryRoutes = require("./routes/countryRoute");
const cors = require("cors");
const connectDB = require("./config/db"); // Import file kết nối MongoDB
const userRouter = require("./routes/userRoute");
const cookieParser = require("cookie-parser");
require("dotenv").config(); // Load biến môi trường từ file .env
// Khởi tạo ứng dụng Express
const app = express();
const port = 3010;

// Kết nối đến MongoDB
connectDB();
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // Thay bằng domain của frontend
    credentials: true,
  })
);
// Sử dụng middleware để parse cookies
app.use(bodyParser.json());
// Định nghĩa các route cho API
app.use("/api/movies", moviesRouter);
app.use("/api/users", userRouter);
app.use("/api/genres", genreRouter);
app.use("/api/countries", countryRoutes);

// Khởi động server và lắng nghe các request trên port đã chỉ định
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
