import express from "express";
import User, { IUser } from "../models/User";
import {
  validateEmail,
  validateMongoId,
  validateUserUpdate,
} from "../utils/validators";

const router = express.Router();

//api to get all user from DB
router.get("/feed", async (req, res) => {
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

//get a single user by emailId
router.get("/user", async (req, res) => {
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

//get user by ID
router.get("/user:id", async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const idValidation = validateMongoId(id);
  if (!idValidation.isValid) {
    return res.status(400).json({
      message: idValidation.message,
    });
  }

  try {
    const user = await User.findById(id).select("-password");
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

//delete user by Id
router.delete("/user:userId", async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const idValidation = validateMongoId(userId);
  if (!idValidation.isValid) {
    return res.status(400).json({
      message: idValidation.message,
    });
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

//update user
router.patch("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  const userData = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const idValidation = validateMongoId(userId);
  if (!idValidation.isValid) {
    return res.status(400).json({
      message: idValidation.message,
    });
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
