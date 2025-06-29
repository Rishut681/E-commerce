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
        const register_error = {
            status: 500,
            message: error.errors[0].message,
        }

        next(register_error);
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
        const login_error = {
            status: 500,
            message: error.errors[0].message,
        }

        next(login_error);
    }
};

const user = async (req, res) => {
    try {
        const userData = req.user;
        res.status(200).json({ userData });
    } catch (error) {
        console.log(`error from user route ${error}`);
    }
};

module.exports = { home, register, login, user };