import express from "express";
import auth from "../middleware/auth";
import {
  getReceivedRequests,
  getUserConnections,
  getUserFeed,
} from "../controllers/userController";

const router = express.Router();

router.use(auth);

router.get("/requests/received", getReceivedRequests);
router.get("/connections", getUserConnections);
router.get("/feed", getUserFeed);

export default router;
