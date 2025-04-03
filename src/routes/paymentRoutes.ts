import express from "express";
import { createPayment, webhook, verify } from "../controllers/paymentController";
import auth from "../middleware/auth";

const router = express.Router();
// router.use(auth);

router.post("/create", auth, createPayment);
//donot protect the webhook route
router.post("/webhook", webhook);
router.get("/verify", auth, verify);

export default router;
 