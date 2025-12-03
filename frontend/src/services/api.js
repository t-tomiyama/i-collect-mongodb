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
      "https://i-collect-mongodb-backend.vercel.app/",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Erro MongoDB: ${error.message}`);
  }
};

// Conecta ao banco imediatamente
connectDB();

app.get("/", (req, res) => {
  res.json({ message: "API i-collect rodando com MongoDB!" });
});

app.use("/auth", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/binders", binderRoutes);
app.use("/search", searchRoutes);
app.use("/payments", paymentRoutes);
app.use("/ratings", ratingRoutes);

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando localmente na porta ${PORT}`);
  });
}

export default app;
