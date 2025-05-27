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

app.use(express.json());
app.use(cookieParser());

// Correct CORS setup
app.use(cors({
  origin: [
    "http://localhost:5173",  // local dev
    "https://chat-app-frontend-lnmseem2f-tests-projects-4d1794d2.vercel.app",
    "https://chat-app-frontend-chi-eight.vercel.app"
  ],
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

const startServer = (port) => {
  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    connectDB();
  }).on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.log(`Port ${port} is busy, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', error);
    }
  });
};

startServer(PORT);

export const someFunction = () => {
  // Your code here
};