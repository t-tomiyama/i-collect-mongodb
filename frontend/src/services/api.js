import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import authRoutes from "../routes/auth.js";
import dashboardRoutes from "../routes/dashboard.js";
import binderRoutes from "../routes/binders.js";
import searchRoutes from "../routes/search.js";
import paymentRoutes from "../routes/payments.js";
import ratingRoutes from "../routes/ratings.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "https://i-collect-mongodb.vercel.app",
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI não definida nas variáveis de ambiente!");
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = !!conn.connections[0].readyState;
    console.log(`✅ MongoDB Conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Erro MongoDB: ${error.message}`);
  }
};

app.use(async (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  await connectDB();
  next();
});

app.get("/", (req, res) => {
  res.json({ message: "API i-collect rodando com MongoDB!" });
});

app.use("/auth", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/binders", binderRoutes);
app.use("/search", searchRoutes);
app.use("/payments", paymentRoutes);
app.use("/ratings", ratingRoutes);

export default app;
