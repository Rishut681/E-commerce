const User = require("../models/user-model");

// 📌 Get all addresses of logged-in user
const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.userID).select("addresses");
    res.status(200).json({ addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch addresses", error: error.message });
  }
};

// 📌 Add new address
const addAddress = async (req, res) => {
  try {
    const { line1, line2, city, state, country, pincode, mobile, type } = req.body;

    const user = await User.findById(req.userID);
    user.addresses.push({ line1, line2, city, state, country, pincode, mobile, type });
    await user.save();

    res.status(201).json({ message: "Address added successfully", addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: "Failed to add address", error: error.message });
  }
};

// 📌 Update address
const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const updates = req.body;

    const user = await User.findById(req.userID);
    const address = user.addresses.id(addressId);
    if (!address) return res.status(404).json({ message: "Address not found" });

    Object.assign(address, updates);
    await user.save();

    res.status(200).json({ message: "Address updated", addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: "Failed to update address", error: error.message });
  }
};

// 📌 Delete address
const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.userID);
    user.addresses = user.addresses.filter((a) => a._id.toString() !== addressId);
    await user.save();

    res.status(200).json({ message: "Address deleted", addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete address", error: error.message });
  }
};

module.exports = { getAddresses, addAddress, updateAddress, deleteAddress };
