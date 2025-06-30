// backend/controllers/category-controller.js

const Category = require('../models/category-model'); // Adjust path to your Category model

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    // Find all categories and return only their _id and name
    const categories = await Category.find({}, '_id name'); 
    
    res.status(200).json(categories); // Send an array of category objects
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getCategories
};
