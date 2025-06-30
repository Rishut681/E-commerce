// backend/middlewares/admin-middleware.js

const adminMiddleware = (req, res, next) => {
  // authMiddleware must run before this to populate req.user
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: "Access denied. Admin privileges required." });
  }
  next(); // User is an admin, proceed to the next middleware/controller
};

module.exports = adminMiddleware;
