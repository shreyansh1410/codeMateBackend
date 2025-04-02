import express from "express";
import auth from "../middleware/auth";
import { getChat } from "../controllers/chatController";

const router = express.Router();

router.use(auth);

router.get("/:targetUserId", getChat);

export default router;