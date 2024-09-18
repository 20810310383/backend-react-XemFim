// routes/user.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authmiddleware");
const UserSchema = require("../models/userModel");

//route Đăng ký người dùng
router.post("/register", userController.registerUser);

// route đăng nhập người dùng
router.post("/login", userController.loginUser);

// route đăng xuất người dùng
router.get("/logout", userController.logoutUser);
// Lấy tất cả dữ liệu người dùng
router.get("/", userController.getAllUsers);
// Lấy dữ liệu người dùng đang đăng nhập
router.get("/user", authMiddleware.authenticate, userController.getCurrentUser);
// Cập nhật người dùng hiện tại
router.put(
  "/user",
  authMiddleware.authenticate,
  userController.updateCurrentUser
);
//Cấp quyền cho người dùng
router.patch(
  "/:id",
  authMiddleware.authenticate,
  authMiddleware.authorizeAdmin,
  userController.updateUser
);

//Xóa người dùng
router.delete("/:id", authMiddleware.authenticate, userController.deleteUser);
//Xác thực người dùng
router.get("/profile", userController.verifyToken, async (req, res) => {
  try {
    // Lấy thông tin người dùng từ req.user đã được set trong middleware
    const user = await UserSchema.findById(req.user._id);
    res.json({ status: true, user });
  } catch (err) {
    res
      .status(500)
      .json({ status: false, msg: "Failed to get user", error: err.message });
  }
});

// Bảo vệ endpoint xác thực quyền admin
router.get(
  "/protected",
  authMiddleware.authenticate,
  authMiddleware.authorizeAdmin,
  (req, res) => {
    res.json({ status: true, msg: "You have admin access." });
  }
);

module.exports = router;
