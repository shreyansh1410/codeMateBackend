import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/authController";
import auth from "../middleware/auth";

const router = express.Router();

// Authentication routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", auth, logoutUser);

export default router;
