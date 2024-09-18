// controllers/userController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// Controller function to handle user registration
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: false, msg: "Username already taken" });
    }
    const existingUserEmail = await User.findOne({ email });
    if (existingUserEmail) {
      return res
        .status(400)
        .json({ status: false, msg: "Email already taken" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.json({ status: true, msg: "User registered successfully" });
  } catch (err) {
    res.status(500).json({
      status: false,
      msg: "Failed to register user",
      error: err.message,
    });
  }
};

// Controller function to handle user login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!email) {
      return res.status(400).json({ status: false, msg: "Invalid email " });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ status: false, msg: "Invalid  password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { _id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3600000,
      sameSite: "Lax",
      secure: true,
    });
    res.json({ status: true, msg: "User Login successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ status: false, msg: "Failed to login", error: err.message });
  }
};

// Controller function to handle user logout
exports.logoutUser = async (req, res) => {
  try {
    res.clearCookie("token");
    res.json({ status: true, msg: "Logout successful" });
  } catch (err) {
    res
      .status(500)
      .json({ status: false, msg: "Failed to logout", error: err.message });
  }
};
// Controller function to get all users (admin access only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}); // Exclude password from the result
    res.json({ status: true, users });
  } catch (err) {
    res
      .status(500)
      .json({ status: false, msg: "Failed to get users", error: err.message });
  }
};
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({ status: true, user });
  } catch (err) {
    res
      .status(500)
      .json({ status: false, msg: "Failed to get user", error: err.message });
  }
};
//Cập nhật thông tin người dùng
exports.updateCurrentUser = async (req, res) => {
  try {
    // Lấy thông tin người dùng từ req.body
    const { username, password } = req.body;

    // Kiểm tra xem req.user._id có tồn tại
    if (!req.user._id) {
      return res.status(403).json({ status: false, msg: "Unauthorized" });
    }

    // Tạo một đối tượng updateData chỉ chứa những trường cần cập nhật
    let updateData = {};

    // Nếu có username, thêm vào updateData
    if (username) {
      updateData.username = username;
    }

    // Nếu có cập nhật mật khẩu, hash lại mật khẩu mới và thêm vào updateData
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Cập nhật thông tin người dùng chỉ với những trường trong updateData
    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
    });

    // Trả về kết quả
    res.json({ status: true, user });
  } catch (err) {
    res.status(500).json({
      status: false,
      msg: "Failed to update user",
      error: err.message,
    });
  }
};
exports.verifyToken = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res
      .status(401)
      .json({ status: false, msg: "Access Denied. No token provided." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Lưu thông tin user đã được giải mã từ token vào req.user
    next(); // Chuyển tiếp sang middleware hoặc route tiếp theo
  } catch (err) {
    return res.status(401).json({ status: false, msg: "Invalid token." });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      return res
        .status(404)
        .json({ status: false, msg: "User not found before deletion" });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res
        .status(404)
        .json({ status: false, msg: "User not found during deletion" });
    }

    res.json({ status: true, msg: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({
      status: false,
      msg: "Failed to delete user",
      error: err.message,
    });
  }
};
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    res.json({ status: true, user });
  } catch (err) {
    res
      .status(500)
      .json({ status: false, msg: "Failed to get user", error: err.message });
  }
};
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAdmin } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isAdmin },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ status: false, msg: "User not found" });
    }

    res.json({
      status: true,
      msg: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({
      status: false,
      msg: "Failed to update user",
      error: err.message,
    });
  }
};
