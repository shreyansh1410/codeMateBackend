import express from "express";
import { createPayment, webhook } from "../controllers/paymentController";
import auth from "../middleware/auth";

const router = express.Router();
// router.use(auth);

router.post("/create", auth, createPayment);
//donot protect the webhook route
router.post("/webhook", webhook);

export default router;
