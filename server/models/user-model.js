const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  role: { type: String, enum: ["customer", "admin"], default: "customer" },
}, { timestamps: true });

// Hashing Pasword encyption using bcrypt.js
userSchema.pre('save', async function (next) {
  try {
    if (this.isModified('password')) {
      const saltRounds = 10;
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
    next();
  } catch (error) {
    next(error);
  }
});

// using json web token to generate token 
userSchema.methods.generateToken = async function () {
  try {
    const token = await jwt.sign({
      userID: this._id.toString(),
      email: this.email,
      isAdmin: this.role === "admin",
    }, process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );
    return token;
  } catch (error) {
    const token_error = {
      status: 500,
      message: "error in generating token",
      extraDetails: error.message,
    }

    next(token_error);
  }
};

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);

};

const User = new mongoose.model("User", userSchema);
module.exports = User;