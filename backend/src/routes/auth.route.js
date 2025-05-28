// routes/auth.route.js - Updated with debug logging
import express from "express";
import { signup, login, logout, updateProfile, checkAuth } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

console.log("🔧 Setting up auth routes...");

// Test route to verify auth routes are working
router.get("/test", (req, res) => {
  console.log("✅ Auth test route hit");
  res.json({ message: "Auth routes are working!" });
});

// Auth routes
router.post("/signup", (req, res, next) => {
  console.log("📝 Signup route hit:", req.body);
  next();
}, signup);

router.post("/login", (req, res, next) => {
  console.log("🔐 Login route hit:", req.body);
  next();
}, login);

router.post("/logout", (req, res, next) => {
  console.log("👋 Logout route hit");
  next();
}, logout);

router.put("/update-profile", (req, res, next) => {
  console.log("👤 Update profile route hit");
  next();
}, protectRoute, updateProfile);

router.get("/check", (req, res, next) => {
  console.log("✅ Check auth route hit");
  next();
}, protectRoute, checkAuth);

console.log("✅ Auth routes configured successfully");

export default router;