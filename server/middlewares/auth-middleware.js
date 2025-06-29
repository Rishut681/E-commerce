const jwt = require("jsonwebtoken");
const User = require("../models/user-model");

const authMiddleware = async(req, res, next) => {
  // get token from header
  const token = req.header("Authorization");
  
  if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const jwtToken = token.replace('Bearer',"").trim();
    
    try {
        const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
        const userData = await User.findOne({ email: decoded.email }).
        select({
            password: 0,
        });
        if (!userData) {
            return res.status(401).json({ message: "User not found" });
        }
        req.user = userData;
        req.token = token;
        req.userID = userData.userID
        next();
    } catch (error) {
        res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = authMiddleware;