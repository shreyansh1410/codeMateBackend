import express from "express";
import {
  registerUser,
  loginUser,
} from "../controllers/authController";
import auth from "../middleware/auth";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);

export default router;
