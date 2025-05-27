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

console.log("Starting the server...");

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS setup (make sure frontend URLs are correct)
const allowedOrigins = [
  "http://localhost:5173",
  "https://chat-app-frontend-chi-eight.vercel.app",
  "https://chat-app-frontend-lnmseem2f-tests-projects-4d1794d2.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow non-browser requests
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Serve frontend (production)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

// Connect to DB first, then start server
const startServer = async (port) => {
  try {
    await connectDB();
    server.listen(port, () => {
      console.log(`✅ Server is running on port ${port}`);
    }).on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.warn(`⚠️ Port ${port} is in use, trying ${port + 1}...`);
        startServer(port + 1);
      } else {
        console.error('❌ Server error:', error);
      }
    });
  } catch (err) {
    console.error("Failed to connect to database", err);
    process.exit(1); // exit if DB connection fails
  }
};

startServer(PORT);

// Optional: Error handler middleware (for CORS and others)
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});
