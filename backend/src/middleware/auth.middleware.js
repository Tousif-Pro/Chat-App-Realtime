// middleware/auth.middleware.js
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    console.log("🔐 Auth middleware triggered");
    console.log("🍪 Cookies received:", req.cookies);
    console.log("📋 Authorization header:", req.headers.authorization);

    // Try to get token from cookies first, then from Authorization header
    let token = req.cookies.jwt;
    
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    console.log("🎫 Token found:", token ? "Yes" : "No");

    if (!token) {
      console.log("❌ No token provided");
      return res.status(401).json({ 
        error: "Unauthorized - No token provided",
        message: "Please login to access this resource" 
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ Token decoded successfully for user:", decoded.userId);

      const user = await User.findById(decoded.userId).select("-password");
      
      if (!user) {
        console.log("❌ User not found for token");
        return res.status(401).json({ 
          error: "Unauthorized - User not found" 
        });
      }

      req.user = user;
      console.log("✅ User authenticated:", user.email);
      next();

    } catch (jwtError) {
      console.log("❌ JWT verification failed:", jwtError.message);
      
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: "Unauthorized - Token expired",
          expired: true 
        });
      }
      
      return res.status(401).json({ 
        error: "Unauthorized - Invalid token" 
      });
    }

  } catch (error) {
    console.error("❌ Auth middleware error:", error.message);
    res.status(500).json({ 
      error: "Internal server error" 
    });
  }
};