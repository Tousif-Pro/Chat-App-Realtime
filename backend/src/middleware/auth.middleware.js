// middleware/auth.middleware.js - Enhanced with debugging
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    console.log("🔐 Auth middleware triggered for:", req.method, req.url);
    console.log("🌐 Origin:", req.headers.origin);
    console.log("🍪 All cookies:", JSON.stringify(req.cookies, null, 2));
    console.log("📋 All headers:", JSON.stringify(req.headers, null, 2));

    // Try to get token from cookies first
    let token = req.cookies.jwt;
    console.log("🎫 JWT cookie found:", token ? "Yes" : "No");
    
    // Fallback to Authorization header
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
        console.log("🎫 Bearer token found in header");
      }
    }

    if (!token) {
      console.log("❌ No token found in cookies or headers");
      return res.status(401).json({ 
        error: "Unauthorized - No token provided",
        message: "Please login to access this resource",
        debug: {
          cookiesReceived: Object.keys(req.cookies),
          hasAuthHeader: !!req.headers.authorization
        }
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
        error: "Unauthorized - Invalid token",
        jwtError: jwtError.message
      });
    }

  } catch (error) {
    console.error("❌ Auth middleware error:", error.message);
    res.status(500).json({ 
      error: "Internal server error" 
    });
  }
};