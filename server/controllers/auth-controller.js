const errorHandler = require("../middlewares/error-middleware");
const User = require("../models/user-model");

const home = async (req, res) => {
    try {
        res
            .status(200)
            .json({ message: "Welcome! We are looking forward to seeing you more" });
    } catch (error) {
        console.log("error");
    }
};

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json("user already exist");
        }

        const data = await User.create({ name, email, password });

        res
            .status(200)
            .json({
                msg: "user registered successfully",
                token: await data.generateToken(),
                userID: data._id.toString(),
            });
    } catch (error) {
        res.status(500).json({ message: error.message });

    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const userExist = await User.findOne({ email });
        if (!userExist) {
            return res.status(400).json("user does not exist");
        }

        // const isMatch = await bcrypt.compare(password, userExist.password);
        const isMatch = await userExist.comparePassword(password);
        if (isMatch) {
            res
                .status(200)
                .json({
                    msg: "user logged in successfully",
                    token: await userExist.generateToken(),
                    userID: userExist._id.toString(),
                });

        } else {
            return res.status(400).json("Invalid credentials");
        }
    } catch (error) {
        res.status(500).json({ message: error.message });

    }
};

const user = async (req, res) => {
    try {
    const userData = await User.findById(req.userID).select("-password");
    if (!userData) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user: userData });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user", error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.userID, // comes from authMiddleware
      { name, phone, address },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "Profile updated", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    const user = await User.findById(req.userID);
    if (!user) return res.status(404).json({ message: "User not found" });

    // verify old password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: "Incorrect current password" });

    // update to new password
    user.password = newPassword; // will be hashed by pre('save') hook
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to change password", error: error.message });
  }
};

module.exports = { home, register, login, user, updateUser, changePassword };