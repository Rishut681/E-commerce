const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const addressSchema = new mongoose.Schema({
  line1: { type: String, required: true },
  line2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  pincode: { type: String, required: true },
  mobile: { type: String, required: true },
  addressType: { type: String, enum: ["Home", "Work", "Other"], default: "Home" },
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ["customer", "admin"], default: "customer" },
  addresses: [addressSchema],
}, { timestamps: true });

userSchema.pre('save', async function (next) {
// Hashing Pasword encyption using bcrypt.js
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