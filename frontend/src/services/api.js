import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import binderRoutes from "./routes/binders.js";
import searchRoutes from "./routes/search.js";
import paymentRoutes from "./routes/payments.js";
import ratingRoutes from "./routes/ratings.js";

dotenv.config();

const app = express();

// FIXED CORS configuration
app.options("*", cors()); // Handle preflight for all routes

app.use(
  cors({
    origin: [
      "https://i-collect-mongodb.vercel.app",
      "https://i-collect-mongodb-backend.vercel.app",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use(express.json());

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("MongoDB already connected");
    return;
  }

  try {
    console.log("Connecting to MongoDB...");
    console.log("MongoDB URI exists:", !!process.env.MONGODB_URI);

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = !!conn.connections[0].readyState;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    console.error("Full error:", error);
    // Don't throw here, let the app continue (for Vercel)
  }
};

// Don't await here, just call it
connectDB().catch(console.error);

// Test endpoint
app.get("/", (req, res) => {
  res.json({
    message: "API i-collect rodando com MongoDB!",
    timestamp: new Date().toISOString(),
    mongoConnected: isConnected,
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    mongo: isConnected ? "connected" : "disconnected",
  });
});

// Debug endpoint
app.get("/test-db", async (req, res) => {
  try {
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        error: "MongoDB not connected",
        isConnected: false,
      });
    }

    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    const users = await mongoose.connection.db
      .collection("app_user")
      .find({})
      .limit(5)
      .toArray();

    res.json({
      success: true,
      connected: isConnected,
      collections: collections.map((c) => c.name),
      userCount: users.length,
      sampleUsers: users.map((u) => ({
        id: u.id,
        email: u.email,
        username: u.username,
        hasPassword: !!u.PASSWORD,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Routes
app.use("/auth", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/binders", binderRoutes);
app.use("/search", searchRoutes);
app.use("/payments", paymentRoutes);
app.use("/ratings", ratingRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

export default app;
