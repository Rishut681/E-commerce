// This script connects to MongoDB, clears specified collections,
// and then re-populates them with new data including category mapping.

// Load environment variables (e.g., MONGODB_URI)
require('dotenv').config();

// MongoDB/Mongoose imports
const mongoose = require('mongoose');
const Category = require('./models/category-model'); // Adjust path as needed
const Product = require('./models/product-model');   // Adjust path as needed
const User = require('./models/user-model');         // Adjust path as needed (for optional user seeding)
const bcrypt = require('bcryptjs');                  // For hashing admin password
const connectDB = require('./utils/db');             // Adjust path to your DB connection utility

// Ensure your .env file has MONGODB_URI set, e.g., MONGODB_URI=mongodb://127.0.0.1:27017/nexamart_db
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nexamart_db'; 

// --- Data Definitions ---

// Categories Data
const categoriesData = [
  { name: "Electronics" },
  { name: "Wearables" },
  { name: "Home & Kitchen" },
  { name: "Apparel" },
  { name: "Men's Clothing" },
  { name: "Women's Clothing" },
  { name: "Footwear" },
  { name: "Smartphones" },
  { name: "Laptops" },
  { name: "Televisions" },
  { name: "Audio" },
  { name: "Books" },
  { name: "Sports & Outdoors" },
  { name: "Automotive" },
  { name: "Groceries" },
  { name: "Health & Beauty" },
  { name: "Toys & Games" },
  { name: "Pet Supplies" },
  { name: "Furniture" }, 
  { name: "Kitchen Appliances" },
  { name: "Gaming" },
  { name: "Cameras" },
  { name: "Jewelry" }, 
  { name: "Bags & Luggage" }
];

// Product Data with categoryName (string name for mapping)
const productsData = [
  { "name": "Wireless Bluetooth Headset Pro", "description": "High-fidelity audio with active noise cancellation. 30-hour battery life. Perfect for travel and work.", "price": 129.99, "stock": 150, "image": "https://placehold.co/600x400/3a2cdb/ffffff?text=Headset+Pro", "categoryName": "Audio" },
  { "name": "Smart Fitness Tracker X", "description": "Advanced health monitoring with heart rate, SpO2, sleep tracking. Waterproof and lightweight design.", "price": 89.99, "stock": 200, "image": "https://placehold.co/600x400/6c63ff/ffffff?text=Tracker+X", "categoryName": "Wearables" },
  { "name": "Ultra-Fast 20000mAh Power Bank", "description": "Charge multiple devices simultaneously with 65W PD fast charging. Compact and portable for all your adventures.", "price": 49.99, "stock": 300, "image": "https://placehold.co/600x400/ff6b6b/ffffff?text=Power+Bank", "categoryName": "Electronics" },
  { "name": "65-inch 4K OLED Smart TV", "description": "Stunning cinematic experience with vibrant colors and deep blacks. Smart features with voice control.", "price": 1299.00, "stock": 50, "image": "https://placehold.co/600x400/4CAF50/ffffff?text=OLED+TV", "categoryName": "Televisions" },
  { "name": "Ergonomic Mesh Office Chair Deluxe", "description": "Superior comfort and support for long hours. Breathable mesh back and adjustable lumbar support.", "price": 249.50, "stock": 75, "image": "https://placehold.co/600x400/8e44ad/ffffff?text=Office+Chair", "categoryName": "Furniture" },
  { "name": "Insulated Stainless Steel Bottle 1L", "description": "Keeps drinks cold for 36 hours or hot for 18 hours. Leak-proof design.", "price": 19.99, "stock": 250, "image": "https://placehold.co/600x400/3498db/ffffff?text=Water+Bottle", "categoryName": "Home & Kitchen" },
  { "name": "Men's Premium Slim Fit Jeans", "description": "Modern slim fit jeans made from high-quality stretch denim. Comfortable and stylish for any occasion.", "price": 69.00, "stock": 90, "image": "https://placehold.co/600x400/27ae60/ffffff?text=Slim+Jeans", "categoryName": "Men's Clothing" },
  { "name": "Women's Elegant Maxi Dress", "description": "Flowy maxi dress with a beautiful floral print. Perfect for summer parties and casual wear.", "price": 45.50, "stock": 120, "image": "https://placehold.co/600x400/9b59b6/ffffff?text=Maxi+Dress", "categoryName": "Women's Clothing" },
  { "name": "Gaming Laptop Beast RTX 4080", "description": "Unrivaled gaming performance with Intel i9, RTX 4080, and 300Hz display. Liquid cooling for sustained power.", "price": 2499.00, "stock": 25, "image": "https://placehold.co/600x400/e67e22/ffffff?text=Gaming+Laptop", "categoryName": "Gaming" },
  { "name": "Deluxe Non-Stick Cookware Set (10-Piece)", "description": "Complete set of durable non-stick pots and pans. Induction ready and easy to clean.", "price": 129.99, "stock": 60, "image": "https://placehold.co/600x400/f1c40f/ffffff?text=Cookware+Set", "categoryName": "Kitchen Appliances" },
  { "name": "Flagship Android Smartphone Z", "description": "Next-gen smartphone with triple camera system, stunning AMOLED display, and all-day battery.", "price": 999.00, "stock": 100, "image": "https://placehold.co/600x400/3366ff/ffffff?text=Smartphone+Z", "categoryName": "Smartphones" },
  { "name": "Men's Pro Running Shoes", "description": "Engineered for speed and comfort. Lightweight design with responsive cushioning and superior grip.", "price": 85.00, "stock": 180, "image": "https://placehold.co/600x400/2ecc71/ffffff?text=Pro+Running", "categoryName": "Footwear" },
  { "name": "Giant Building Blocks Set (1000 Pcs)", "description": "Unleash creativity with a massive set of colorful building blocks. Ideal for collaborative play.", "price": 39.99, "stock": 300, "image": "https://placehold.co/600x400/ff9900/ffffff?text=Building+Blocks", "categoryName": "Toys & Games" },
  { "name": "Professional DSLR Camera Kit", "description": "Capture stunning photos and videos with high-resolution sensor and versatile lens. Includes carry bag.", "price": 799.00, "stock": 40, "image": "https://placehold.co/600x400/d35400/ffffff?text=DSLR+Camera", "categoryName": "Cameras" },
  { "name": "Diamond Pendant Necklace", "description": "Elegant sterling silver necklace with a brilliant cut diamond pendant. Perfect for gifting.", "price": 299.00, "stock": 70, "image": "https://placehold.co/600x400/e74c3c/ffffff?text=Diamond+Necklace", "categoryName": "Jewelry" },
  { "name": "Travel Laptop Backpack", "description": "Durable and water-resistant backpack with padded laptop compartment. Ideal for daily commute or travel.", "price": 59.00, "stock": 120, "image": "https://placehold.co/600x400/f39c12/ffffff?text=Travel+Backpack", "categoryName": "Bags & Luggage" },
  { "name": "Premium Wireless Mouse", "description": "Ergonomic design with silent clicks and adjustable DPI. Long battery life and multi-device connectivity.", "price": 25.00, "stock": 400, "image": "https://placehold.co/600x400/555555/ffffff?text=Wireless+Mouse", "categoryName": "Electronics" },
  { "name": "Smart Watch Ultra 2", "description": "Next-level smartwatch with advanced fitness tracking, GPS, and cellular connectivity.", "price": 399.00, "stock": 80, "image": "https://placehold.co/600x400/1abc9c/ffffff?text=Smart+Watch+Ultra", "categoryName": "Wearables" },
  { "name": "Robot Vacuum Cleaner with Mop", "description": "Automated cleaning with powerful suction and integrated mopping. App-controlled and self-charging.", "price": 299.00, "stock": 90, "image": "https://placehold.co/600x400/7f8c8d/ffffff?text=Robot+Vacuum", "categoryName": "Home & Kitchen" },
  { "name": "Classic Fit Polo Shirt - Men's", "description": "Soft cotton polo shirt, perfect for casual and semi-formal wear. Available in multiple colors.", "price": 29.50, "stock": 150, "image": "https://placehold.co/600x400/34495e/ffffff?text=Polo+Shirt", "categoryName": "Men's Clothing" },
  { "name": "Elegant A-line Skirt - Women's", "description": "Flowy A-line skirt with comfortable elastic waistband. Versatile for office or casual wear.", "price": 38.00, "stock": 110, "image": "https://placehold.co/600x400/95a5a6/ffffff?text=A-line+Skirt", "categoryName": "Women's Clothing" },
  { "name": "Professional Gaming Keyboard", "description": "Mechanical gaming keyboard with customizable RGB lighting and macro keys for competitive play.", "price": 89.00, "stock": 70, "image": "https://placehold.co/600x400/c0392b/ffffff?text=Gaming+Keyboard", "categoryName": "Gaming" },
  { "name": "Noise Cancelling Headphones", "description": "Immersive sound and superior comfort with industry-leading noise cancellation. Perfect for travel.",
    "price": 199.00, "stock": 100, "image": "https://placehold.co/600x400/8e44ad/ffffff?text=Headphones", "categoryName": "Audio" },
  { "name": "Adventure Backpack 50L", "description": "Large capacity backpack for hiking and camping. Durable, water-resistant fabric with multiple compartments.", "price": 75.00, "stock": 60, "image": "https://placehold.co/600x400/2980b9/ffffff?text=Adventure+Backpack", "categoryName": "Sports & Outdoors" },
  { "name": "Car Phone Mount (Universal)", "description": "Secure and adjustable car phone mount for safe navigation. Compatible with most smartphones.", "price": 18.00, "stock": 200, "image": "https://placehold.co/600x400/16a085/ffffff?text=Car+Mount", "categoryName": "Automotive" },
  { "name": "Organic Coffee Beans (500g)", "description": "Premium Arabica coffee beans, medium roast. Rich flavor and aromatic experience.", "price": 12.50, "stock": 300, "image": "https://placehold.co/600x400/f39c12/ffffff?text=Coffee+Beans", "categoryName": "Groceries" },
  { "name": "Anti-Aging Serum with Hyaluronic Acid", "description": "Rejuvenating serum for smoother, firmer skin. Reduces fine lines and improves hydration.", "price": 45.00, "stock": 100, "image": "https://placehold.co/600x400/9b59b6/ffffff?text=Anti-Aging+Serum", "categoryName": "Health & Beauty" },
  { "name": "Board Game - Strategy Master", "description": "Engaging strategy board game for 2-4 players. Perfect for family game nights.", "price": 35.00, "stock": 100, "image": "https://placehold.co/600x400/3498db/ffffff?text=Board+Game", "categoryName": "Toys & Games" },
  { "name": "Pet Grooming Brush", "description": "Gentle and effective grooming brush for dogs and cats. Reduces shedding and keeps fur healthy.", "price": 14.00, "stock": 150, "image": "https://placehold.co/600x400/8e44ad/ffffff?text=Pet+Brush", "categoryName": "Pet Supplies" },
  { "name": "Modern Coffee Table", "description": "Stylish and functional coffee table with ample storage. Perfect centerpiece for your living room.",
    "price": 150.00, "stock": 40, "image": "https://placehold.co/600x400/2ecc71/ffffff?text=Coffee+Table", "categoryName": "Furniture" }
];


const defaultAdminUser = {
  name: "Admin User",
  email: "admin@example.com",
  password: "adminpassword",
  role: "admin"
};

// Ensure connectDB is called to establish MongoDB connection
connectDB(); 

const seedDatabase = async () => {
  try {
    console.log('--- Starting Database Seeding ---');
    console.log('Clearing existing products and categories...');
    await Product.deleteMany({}); // Always clear products for a fresh seed
    await Category.deleteMany({}); // Always clear categories for a fresh seed

    // Seed Admin User (only if one doesn't exist)
    // const existingAdmin = await User.findOne({ email: defaultAdminUser.email });
    // if (!existingAdmin) {
    //   console.log('Seeding admin user...');
    //   const hashedPassword = await bcrypt.hash(defaultAdminUser.password, 10);
    //   const adminUser = new User({
    //     name: defaultAdminUser.name,
    //     email: defaultAdminUser.email,
    //     password: hashedPassword,
    //     role: defaultAdminUser.role
    //   });
    //   await adminUser.save();
    //   console.log('Admin user seeded:', adminUser.email);
    // } else {
    //   console.log('Admin user already exists:', existingAdmin.email);
    // }

    // Seed Categories
    console.log('Seeding categories...');
    const createdCategories = await Category.insertMany(categoriesData);
    console.log(`Categories seeded: ${createdCategories.length} categories.`);
    console.log('Seeded Categories (Name: ID):');
    createdCategories.forEach(cat => console.log(`  ${cat.name}: ${cat._id}`));


    // Create a map from category name to its ObjectId
    const categoryMap = createdCategories.reduce((map, cat) => {
      map[cat.name] = cat._id;
      return map;
    }, {});

    // Prepare products with actual category ObjectIds
    console.log('Preparing products for seeding...');
    const productsToInsert = productsData.map(product => {
      const categoryId = categoryMap[product.categoryName];
      if (!categoryId) {
        console.warn(`Warning: Category "${product.categoryName}" not found for product "${product.name}". This product will NOT be seeded.`);
        return null; // Return null for products with missing categories
      }
      return {
        ...product,
        category: categoryId, // Assign the actual ObjectId
        categoryName: undefined // Remove the temporary categoryName field
      };
    }).filter(p => p !== null); // Filter out products that had missing categories

    // Seed Products
    console.log(`Seeding ${productsToInsert.length} products...`);
    await Product.insertMany(productsToInsert);
    console.log('Products seeded successfully!');

    console.log('--- Database Seeding Completed ---');

  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1); // Exit with error code
  } finally {
    // Disconnect from MongoDB after seeding
    if (mongoose.connection.readyState === 1) { 
      await mongoose.disconnect();
      console.log('MongoDB disconnected.');
    }
  }
};

// Call the seeding function
seedDatabase();
