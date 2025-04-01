import { Request, Response } from "express";
import User, { IUser } from "../models/User";
import {
  validateUserUpdate,
  validatePassword,
  validateEmail,
} from "../utils/validators";
import bcrypt from "bcryptjs";

// // Get all users (feed)
// export const getAllUsers = async (req: Request, res: Response) => {
//   try {
//     const users: Array<IUser> = await User.find({}).select("-password");
//     if (!users || users.length === 0) {
//       return res.status(404).json({ message: "No users found" });
//     }
//     res.json(users);
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Something went wrong while fetching users" });
//   }
// };

// export const getUserByEmail = async (req: Request, res: Response) => {
//   const { emailId } = req.body;
//   if (!emailId) {
//     return res.status(400).json({ message: "Email ID is required" });
//   }

//   const emailValidation = validateEmail(emailId);
//   if (!emailValidation.isValid) {
//     return res.status(400).json({
//       message: emailValidation.message,
//     });
//   }

//   try {
//     const user = await User.findOne({
//       emailId: emailValidation.sanitizedData,
//     }).select("-password");
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     res.json(user);
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Something went wrong while fetching user" });
//   }
// };

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
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
};

// Get current user's profile
export const getProfile = async (req: Request, res: Response) => {
  try {
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
};

// Update current user's profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userData = req.body;

    const allowed_updates = [
      "firstName",
      "lastName",
      "gender",
      "skills",
      "bio",
      "age",
      "photoURL",
    ];

    const invalidFields = Object.keys(userData).filter(
      (field) => !allowed_updates.includes(field)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid fields in update request",
        invalidFields,
      });
    }

    const validationResult = validateUserUpdate(userData);
    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        message: validationResult.message,
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      validationResult.sanitizedData,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Error updating profile",
    });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message,
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Error changing password",
    });
  }
};

// Delete current user's profile
// export const deleteProfile = async (req: Request, res: Response) => {
//   try {
//     const user = await User.findByIdAndDelete(req.user._id);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Profile deleted successfully",
//     });
//   } catch (error: any) {
//     res.status(500).json({
//       success: false,
//       message: error.message || "Error deleting profile",
//     });
//   }
// };
