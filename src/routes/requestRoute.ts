import express from "express";
import auth from "../middleware/auth";
import { sendRequest, reviewRequest } from "../controllers/requestController";

const router = express.Router();

router.use(auth);
router.post("/send/:status/:toUserId", sendRequest);
router.post("/review/:status/:fromUserId", reviewRequest);

export default router;