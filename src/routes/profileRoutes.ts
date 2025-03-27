import express from "express";
import {
  getProfile,
  updateProfile,
  deleteProfile,
  changePassword,
  getAllUsers,
  getUserByEmail,
  getUserById,
} from "../controllers/profileController";
import auth from "../middleware/auth";

const router = express.Router();


router.use(auth);

router.get("/feed", getAllUsers);
router.get("/", getProfile);
router.patch("/", updateProfile);
router.post("/change-password", changePassword);
router.delete("/", deleteProfile);

// User search
router.post("/email", getUserByEmail);
router.get("/:userId", getUserById);

export default router;
