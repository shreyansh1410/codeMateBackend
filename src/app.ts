import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import profileRoutes from "./routes/profileRoutes";
import requestRoutes from "./routes/requestRoute";
import userRoutes from "./routes/userRoutes";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: ["http://localhost:5173", "http://3.108.220.117" , "http://localhost:5000", "https://codemate.diy", "http://codemate.diy"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/request", requestRoutes);
app.use("/api/user", userRoutes);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI!;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      message: "Something went wrong!",
    });
  }
);