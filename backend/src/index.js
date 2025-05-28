// server.js - FIXED VERSION FOR RENDER DEPLOYMENT
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import connectDB from './lib/db.js';
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = process.env.PORT || 5003;

console.log("🚀 Starting server...");
console.log("📍 Environment:", process.env.NODE_ENV || 'development');
console.log("🔢 Port:", PORT);

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration - CRITICAL FOR PRODUCTION
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://chat-app-frontend-chi-eight.vercel.app",
  "https://chat-app-frontend-lnmseem2f-tests-projects-4d1794d2.vercel.app",
  // Add your actual frontend domain here
  "https://your-frontend-domain.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl requests, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("❌ CORS rejected origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ===========================================
// API ROUTES - MUST COME BEFORE STATIC FILES
// ===========================================

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: PORT
  });
});

// Test route
app.get('/api/test', (req, res) => {
  console.log("✅ API test route accessed");
  res.json({ 
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// Auth routes
console.log("🔐 Setting up auth routes...");
app.use("/api/auth", authRoutes);

// Message routes  
console.log("💬 Setting up message routes...");
app.use("/api/messages", messageRoutes);

// ===========================================
// STATIC FILES AND FRONTEND ROUTING
// ===========================================

if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/dist");
  console.log("📁 Serving static files from:", frontendPath);
  
  // Serve static files
  app.use(express.static(frontendPath));
  
  // Handle React Router - BUT ONLY FOR NON-API ROUTES
  app.get("*", (req, res) => {
    // If the request is for an API route that doesn't exist, return 404
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ 
        error: "API endpoint not found",
        path: req.path 
      });
    }
    
    // Otherwise, serve the React app
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// ===========================================
// ERROR HANDLING
// ===========================================

// 404 handler for API routes specifically
app.use('/api/*', (req, res) => {
  console.log("❌ API 404:", req.method, req.path);
  res.status(404).json({ 
    error: "API endpoint not found",
    path: req.path,
    method: req.method,
    availableRoutes: [
      "GET /health",
      "GET /api/test", 
      "POST /api/auth/signup",
      "POST /api/auth/login",
      "POST /api/auth/logout",
      "GET /api/auth/check"
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "CORS: Origin not allowed" });
  }
  
  res.status(500).json({ 
    error: "Internal server error",
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// ===========================================
// START SERVER
// ===========================================

const startServer = async () => {
  try {
    console.log("🔌 Connecting to database...");
    await connectDB();
    console.log("✅ Database connected successfully");
    
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
      console.log(`🔧 API test: http://localhost:${PORT}/api/test`);
      console.log("🎯 Available API endpoints:");
      console.log("   POST /api/auth/signup");
      console.log("   POST /api/auth/login"); 
      console.log("   POST /api/auth/logout");
      console.log("   GET  /api/auth/check");
      console.log("   GET  /api/messages/*");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();