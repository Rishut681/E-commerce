// backend/controllers/product-controller.js

const Product = require('../models/product-model');
const Category = require('../models/category-model');
const mongoose = require('mongoose');

// @desc    Get all products with filters, sorting, and pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 12, sort = 'name_asc', search, category, 'price[gte]': priceGte, 'price[lte]': priceLte } = req.query;

    let matchQuery = {}; // Use matchQuery for the aggregation pipeline later
    let searchConditions = []; // Array to hold conditions for $or in search

    // 1. Global Search across name, description, and category name
    if (search) {
      const searchRegex = new RegExp(search, 'i'); // Case-insensitive regex

      // Search in Product name and description
      searchConditions.push(
        { name: { $regex: searchRegex } },
        { description: { $regex: searchRegex } }
      );

      // Find categories whose names match the search term
      const matchingCategories = await Category.find({ name: { $regex: searchRegex } }, '_id');
      if (matchingCategories.length > 0) {
        const matchingCategoryIds = matchingCategories.map(cat => cat._id);
        searchConditions.push({ category: { $in: matchingCategoryIds } });
      }

      // If any search conditions exist, add them to the main matchQuery
      if (searchConditions.length > 0) {
        matchQuery.$or = searchConditions;
      }
    }

    // 2. Category Filter (separate from global search, if both are present)
    // This handles the filter sidebar's category selection which sends 'category' param
    if (category && category !== 'all') {
      const foundCategory = await Category.findOne({ name: category });
      if (foundCategory) {
        // If there's already a global search (matchQuery.$or), this category filter needs to AND with it.
        // Otherwise, it becomes the primary category filter.
        if (matchQuery.$and) {
          matchQuery.$and.push({ category: foundCategory._id });
        } else if (matchQuery.$or) {
          // If a global search is present, we need to apply this category filter
          // as an AND condition with the results of the $or search.
          // This requires restructuring the query if both are active.
          // For simplicity, if a direct 'category' filter is applied, it will narrow down
          // the results that also match the 'search' (if present).
          matchQuery = {
            ...matchQuery, // Keeps the $or for name/description/category-name search
            category: foundCategory._id // Adds the specific category filter
          };
        } else {
          matchQuery.category = foundCategory._id;
        }
      } else {
        // If category name doesn't exist, ensure no products are returned
        return res.status(200).json({
          message: "No products found for the specified category.",
          products: [],
          totalProducts: 0,
          page: parseInt(page),
          limit: parseInt(limit)
        });
      }
    }

    // 3. Price Range Filter
    if (priceGte || priceLte) {
      let priceQuery = {};
      if (priceGte) {
        priceQuery.$gte = parseFloat(priceGte);
      }
      if (priceLte) {
        priceQuery.$lte = parseFloat(priceLte);
      }
      // Add price filter to the main query
      if (matchQuery.price) { // If price already exists from other conditions (unlikely for now)
        Object.assign(matchQuery.price, priceQuery);
      } else {
        matchQuery.price = priceQuery;
      }
    }

    // 4. Sorting Logic
    let sortOptions = {};
    switch (sort) {
      case 'price_asc':
        sortOptions.price = 1;
        break;
      case 'price_desc':
        sortOptions.price = -1;
        break;
      case 'name_desc':
        sortOptions.name = -1;
        break;
      case 'newest':
        sortOptions.createdAt = -1;
        break;
      case 'name_asc':
      default:
        sortOptions.name = 1;
        break;
    }

    // Pagination Calculation
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build the aggregation pipeline for comprehensive filtering and counting
    const pipeline = [];

    // Add match stage if there are any filter conditions
    if (Object.keys(matchQuery).length > 0) {
      pipeline.push({ $match: matchQuery });
    }

    // Count total products matching filters (before pagination)
    const totalProductsResult = await Product.aggregate([
      ...pipeline, // Apply all filters
      { $count: "total" }
    ]);
    const totalProducts = totalProductsResult.length > 0 ? totalProductsResult[0].total : 0;

    // Add sort, skip, limit for fetching products
    pipeline.push(
      { $sort: sortOptions },
      { $skip: skip },
      { $limit: limitNum },
      { $lookup: { // Populate category
          from: 'categories', // The collection name for Category model (usually plural lowercase)
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
      }},
      { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } }, // Unwind the category array
      { $addFields: { // Restructure category info
          category: {
              _id: '$categoryInfo._id',
              name: '$categoryInfo.name'
          }
      }},
      { $project: { categoryInfo: 0 } } // Remove the temporary categoryInfo field
    );
    
    const products = await Product.aggregate(pipeline);

    res.status(200).json({
      message: "Products fetched successfully",
      products,
      totalProducts,
      page: pageNum,
      limit: limitNum
    });

  } catch (error) {
    console.error('Error fetching products with enhanced search:', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Get a single product by ID
// @route   GET /api/products/:id
// @access  Public
const getSingleProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid Product ID format." });
    }

    const product = await Product.findById(req.params.id).populate('category', 'name');

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching single product:', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Admin
const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, image, category } = req.body;

    console.log('Backend (createProduct): Received Body:', req.body);

    if (!name || !price || !category) {
      console.log('Backend (createProduct): Validation Error: Missing required fields (name, price, or category).');
      return res.status(400).json({ message: "Please provide name, price, and category." });
    }

    if (!mongoose.Types.ObjectId.isValid(category)) { 
        console.log('Backend (createProduct): Validation Error: Invalid category ID format provided.', category);
        return res.status(400).json({ message: "Invalid category ID format." });
    }

    const existingCategory = await Category.findById(category);
    if (!existingCategory) {
      console.log('Backend (createProduct): Validation Error: Category not found with the provided ID.', category);
      return res.status(400).json({ message: "Category not found with the provided ID." });
    }

    const newProduct = new Product({
      name,
      description,
      price,
      stock,
      image,
      category 
    });

    const savedProduct = await newProduct.save();
    res.status(201).json({ message: "Product created successfully", product: savedProduct });
  } catch (error) {
    console.error('Backend (createProduct) Error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: `A product with the name "${req.body.name}" already exists.` });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: "Validation error", errors: messages });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, image, category } = req.body;

    console.log('Backend (updateProduct): Received ID:', id);
    console.log('Backend (updateProduct): Received Body:', req.body);

    if (!mongoose.Types.ObjectId.isValid(id)) { 
        console.log('Backend (updateProduct): Invalid Product ID format:', id);
        return res.status(400).json({ message: "Invalid Product ID format." });
    }

    if (category) {
      console.log('Backend (updateProduct): Validating category ID:', category);
      if (!mongoose.Types.ObjectId.isValid(category)) { 
          console.log('Backend (updateProduct): Invalid category ID format:', category);
          return res.status(400).json({ message: "Invalid category ID format." });
      }
      const existingCategory = await Category.findById(category);
      if (!existingCategory) {
        console.log('Backend (updateProduct): Category not found with ID:', category);
        return res.status(400).json({ message: "Category not found with the provided ID." });
      }
      console.log('Backend (updateProduct): Category ID is valid.');
    } else {
      console.log('Backend (updateProduct): Category field not provided or is empty in request body.');
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, description, price, stock, image, category }, 
      { new: true, runValidators: true } 
    ).populate('category', 'name');

    if (!updatedProduct) {
      console.log('Backend (updateProduct): FindByIdAndUpdate returned null (should not happen if productToUpdate was found).');
      return res.status(404).json({ message: "Product not found after update attempt." }); 
    }

    console.log('Backend (updateProduct): Product updated successfully:', updatedProduct.name);
    res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    console.error('Backend (updateProduct) Error:', error); 
    if (error.code === 11000) {
      return res.status(400).json({ message: `A product with the name "${req.body.name}" already exists.` });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: "Validation error", errors: messages });
    }
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
        return res.status(400).json({ message: "Invalid ID format for product or category." });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid Product ID format." });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully", product: deletedProduct });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct
};
