import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import { initializeSocket } from "./websockets/editorSocket.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { initGemini } from "./config/gemini.js";

// Import routes
import authRoutes from "./routes/auth.js";
import documentRoutes from "./routes/documents.js";
import aiRoutes from "./routes/ai.js";

// Connect to database
connectDB();

// Initialize Gemini AI - ADD THIS LINE
initGemini();
console.log("✅ Gemini AI initialized");

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/ai", aiRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Initialize WebSocket
initializeSocket(io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`CollabWrite AI Server Running Port: ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`❌ Error: ${err.message}`);
  server.close(() => process.exit(1));
});

export { app, server, io };