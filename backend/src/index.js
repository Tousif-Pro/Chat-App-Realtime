import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { app, httpServer } from "./lib/socket.io.js";
import cors from "cors"


dotenv.config();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(express.json({ limit: '50mb' }));9
app.use(cookieParser());

// CORS configuration
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["set-cookie"]
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Connect to DB and start server
httpServer.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on PORT ${PORT}`);
});
