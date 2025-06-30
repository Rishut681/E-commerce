// backend/middlewares/auth-middleware.js

const jwt = require("jsonwebtoken");
const User = require("../models/user-model");

const authMiddleware = async(req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    // Expected format: "Bearer YOUR_TOKEN_STRING"
    const jwtToken = token.replace('Bearer', "").trim();

    if (!jwtToken) {
        return res.status(401).json({ message: "Invalid token format." });
    }
    
    try {
        const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);

        // --- FIX HERE: Changed .select() to only include desired fields ---
        // By listing fields with 1 (or just by name string), Mongoose only includes these.
        // The 'password' field will now be implicitly excluded.
        const userData = await User.findOne({ email: decoded.email }).select({
            role: 1,     // Include 'role' for admin check
            name: 1,     // Include 'name' for dashboard display
            email: 1,    // Include 'email'
            // Do NOT include password: 0 here as it conflicts with inclusions.
            // Password is not selected by default when other fields are explicitly included.
        });


        if (!userData) {
            return res.status(401).json({ message: "User not found (from token payload)." });
        }

        // Attach user data and token to the request object
        req.user = userData; 
        req.token = jwtToken;
        req.userID = userData._id; 
        // Also attach a convenient isAdmin boolean based on the role for adminMiddleware
        req.user.isAdmin = userData.role === "admin"; 
        
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Unauthorized. Token has expired. Please log in again." });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Unauthorized. Invalid token. Please log in again." });
        } else {
            return res.status(401).json({ message: "Unauthorized. An authentication error occurred." });
        }
    }
};

module.exports = authMiddleware;
