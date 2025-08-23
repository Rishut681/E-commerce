const User = require("../models/user-model");

// ✅ Get all addresses
const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.userID).select("addresses");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch addresses", error: error.message });
  }
};

// ✅ Add new address
const addAddress = async (req, res) => {
  try {
    const { addressLine1, city, state, country, pincode, mobile, addressType } = req.body;
    const user = await User.findById(req.userID);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.addresses.push({ addressLine1, city, state, country, pincode, mobile, addressType });
    await user.save();

    res.status(200).json({ message: "Address added", userData: user });
  } catch (error) {
    res.status(500).json({ message: "Failed to add address", error: error.message });
  }
};

// ✅ Update address
const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { addressLine1, city, state, country, pincode, mobile, addressType } = req.body;

    const user = await User.findById(req.userID);
    if (!user) return res.status(404).json({ message: "User not found" });

    const address = user.addresses.id(addressId);
    if (!address) return res.status(404).json({ message: "Address not found" });

    address.addressLine1 = addressLine1 || address.addressLine1;
    address.city = city || address.city;
    address.state = state || address.state;
    address.country = country || address.country;
    address.pincode = pincode || address.pincode;
    address.mobile = mobile || address.mobile;
    address.addressType = addressType || address.addressType;

    await user.save();
    res.status(200).json({ message: "Address updated", userData: user });
  } catch (error) {
    res.status(500).json({ message: "Failed to update address", error: error.message });
  }
};

// ✅ Delete address
const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.userID);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.addresses = user.addresses.filter((addr) => addr._id.toString() !== addressId);
    await user.save();

    res.status(200).json({ message: "Address deleted", userData: user });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete address", error: error.message });
  }
};

module.exports = { getAddresses, addAddress, updateAddress, deleteAddress };
