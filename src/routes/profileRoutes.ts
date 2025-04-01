import express from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
  getUserById,
  // deleteProfile,
  // getAllUsers,
  // getUserByEmail,
  // getUserById,
} from "../controllers/profileController";
import auth from "../middleware/auth";

const router = express.Router();
router.get("/:userId", getUserById);

router.use(auth);

router.get("/", getProfile);
router.patch("/", updateProfile);
router.post("/change-password", changePassword);

// router.get("/feed", getAllUsers);
// router.delete("/", deleteProfile);
// User search
// router.post("/email", getUserByEmail);
// router.get("/:userId", getUserById);

export default router;
