import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/codemate";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    //connect to DB and then start listening
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    }); 
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

app.get("/", (req, res) => {
  res.json({ message: "Welcome to CodeMate API" });
});

app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);