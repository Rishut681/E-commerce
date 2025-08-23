const User = require("../models/user-model");

// ✅ Home route
const home = async (req, res) => {
  res.status(200).json({ message: "Welcome to the API" });
};

// ✅ Register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json("user already exist");
    }

    const data = await User.create({ name, email, password });

    res.status(200).json({
      msg: "user registered successfully",
      token: await data.generateToken(),
      userID: data._id.toString(),
      userData: {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      },
    });
  } catch (error) {
    next({ status: 500, message: error.message });
  }
};

// ✅ Login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const userExist = await User.findOne({ email });
    if (!userExist) {
      return res.status(400).json("user does not exist");
    }

    const isMatch = await userExist.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json("Invalid credentials");
    }

    res.status(200).json({
      msg: "user logged in successfully",
      token: await userExist.generateToken(),
      userID: userExist._id.toString(),
      userData: {
        _id: userExist._id,
        name: userExist.name,
        email: userExist.email,
        role: userExist.role,
      },
    });
  } catch (error) {
    next({ status: 500, message: error.message });
  }
};

// ✅ Get logged in user
const user = async (req, res) => {
  try {
    const userData = req.user;
    res.status(200).json({ userData });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user" });
  }
};

// ✅ Update profile
const updateUser = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.userID,
      { name, phone },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      message: "Profile updated",
      userData: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};

// ✅ Change password
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.userID);

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to change password", error: error.message });
  }
};

module.exports = { home, register, login, user, updateUser, changePassword };
