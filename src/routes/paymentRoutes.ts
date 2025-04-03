import express from "express";
import { createPayment } from "../controllers/paymentController";
import auth from "../middleware/auth";

const router = express.Router();
router.use(auth);

router.post("/create", createPayment);


export default router;
