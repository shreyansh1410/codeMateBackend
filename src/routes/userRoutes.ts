import express from "express";
import User, { IUser } from "../models/User";
import { validateEmail, validateUserUpdate } from "../utils/validators";
import auth from "../middleware/auth";

const router = express.Router();

// Get all users (feed)
router.get("/", auth, async (req, res) => {
  try {
    const users: Array<IUser> = await User.find({}).select("-password");
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
    res.json(users);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong while fetching users" });
  }
});

// Current user
router.get("/me", auth, async (req, res) => {
  try {
    // User is already fetched and attached by auth middleware
    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      user: req.user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Error retrieving profile",
    });
  }
});

// Get user by email
router.post("/email", auth, async (req, res) => {
  const { emailId } = req.body;
  if (!emailId) {
    return res.status(400).json({ message: "Email ID is required" });
  }

  const emailValidation = validateEmail(emailId);
  if (!emailValidation.isValid) {
    return res.status(400).json({
      message: emailValidation.message,
    });
  }

  try {
    const user = await User.findOne({
      emailId: emailValidation.sanitizedData,
    }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong while fetching user" });
  }
});

// Get user by ID
router.post("/id", auth, async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong while fetching user" });
  }
});

// Get user by ID (URL param)
router.get("/:userId", auth, async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong while fetching user" });
  }
});

// Delete user (URL param)
router.delete("/:userId", auth, async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong while deleting user" });
  }
});

// Delete user (body)
router.post("/delete", auth, async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong while deleting user" });
  }
});

// Update user (URL param)
router.patch("/:userId", auth, async (req, res) => {
  const { userId } = req.params;
  const userData = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const allowed_updates = [
      "password",
      "firstName",
      "lastName",
      "gender",
      "skills",
      "bio",
      "age",
      "photoURL",
    ];

    // Check for invalid fields
    const invalidFields = Object.keys(userData).filter(
      (field) => !allowed_updates.includes(field)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        message: "Invalid fields in update request",
        invalidFields,
      });
    }

    const validationResult = validateUserUpdate(userData);
    if (!validationResult.isValid) {
      return res.status(400).json({
        message: validationResult.message,
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      validationResult.sanitizedData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailId: user.emailId,
        age: user.age,
        gender: user.gender,
        skills: user.skills,
        bio: user.bio,
        photoURL: user.photoURL,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      message: err.message || "Something went wrong while updating user",
    });
  }
});

// Update user (body)
router.post("/update", auth, async (req, res) => {
  const { userId, ...userData } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const allowed_updates = [
      "password",
      "firstName",
      "lastName",
      "gender",
      "skills",
      "bio",
      "age",
      "photoURL",
    ];

    // Check for invalid fields
    const invalidFields = Object.keys(userData).filter(
      (field) => !allowed_updates.includes(field)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        message: "Invalid fields in update request",
        invalidFields,
      });
    }

    const validationResult = validateUserUpdate(userData);
    if (!validationResult.isValid) {
      return res.status(400).json({
        message: validationResult.message,
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      validationResult.sanitizedData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailId: user.emailId,
        age: user.age,
        gender: user.gender,
        skills: user.skills,
        bio: user.bio,
        photoURL: user.photoURL,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      message: err.message || "Something went wrong while updating user",
    });
  }
});

export default router;
