// routes/message.route.js
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, sendMessage, getUsersForSidebar } from "../controllers/message.controller.js";

const router = express.Router();

// Add logging middleware for debugging
router.use((req, res, next) => {
  console.log(`📨 Message route: ${req.method} ${req.path}`);
  console.log('🍪 Cookies:', req.cookies);
  next();
});

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);

export default router;