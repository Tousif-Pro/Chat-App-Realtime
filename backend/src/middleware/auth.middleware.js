// middleware/auth.middleware.js - with debug logging
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    console.log('🔐 Auth middleware triggered');
    console.log('🍪 All cookies:', req.cookies);
    
    const token = req.cookies.jwt;
    console.log('🎫 Token extracted:', token ? 'Token exists' : 'No token found');

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    console.log('🔍 Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded successfully:', decoded);

    if (!decoded) {
      console.log('❌ Token verification failed');
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    console.log('👤 Finding user with ID:', decoded.userId);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      console.log('❌ User not found for ID:', decoded.userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log('✅ User authenticated:', user.email);
    req.user = user;
    next();
  } catch (error) {
    console.log("❌ Error in protectRoute middleware:", error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Unauthorized - Token Expired" });
    }
    
    res.status(500).json({ message: "Internal server error" });
  }
};