// authMiddleware.js
const jwt = require("jsonwebtoken");

// Hàm middleware để xác thực token JWT của người dùng
const authenticate = (req, res, next) => {
  let token = req.header("Authorization");

  // Nếu không tìm thấy token trong header, thử tìm trong cookies
  if (!token && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    // Nếu không có token, trả về lỗi 401 Unauthorized
    return res
      .status(401)
      .json({ status: false, msg: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );
    req.user = decoded; // Attach user information to request object
    next();
  } catch (err) {
    res.status(400).json({ status: false, msg: "Invalid token." });
  }
};

// Hàm middleware để ủy quyền truy cập admin
const authorizeAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res
      .status(403)
      .json({ status: false, msg: "Access denied. Admin rights required." });
  }
  next();
};

module.exports = {
  authenticate,
  authorizeAdmin,
};
