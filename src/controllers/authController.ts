import { Request, Response } from "express";
import User, { IUser } from "../models/User";
import {
  validateUserRegistration,
  validateEmail,
  validatePassword,
} from "../utils/validators";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const validationResult = validateUserRegistration(req.body);
    if (!validationResult.isValid) {
      return res.status(400).json({
        message: validationResult.message,
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({
      emailId: validationResult.sanitizedData.emailId,
    });
    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    const user = await User.create(validationResult.sanitizedData);

    if (user) {
      res.status(201).json({
        message: "User registered successfully",
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
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error: any) {
    console.error("Register error:", error);
    res.status(500).json({
      message: error.message || "Server error during registration",
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { emailId, password } = req.body;

    // Validate email
    const emailValidation = validateEmail(emailId);
    if (!emailValidation.isValid) {
      return res.status(400).json({
        message: emailValidation.message,
      });
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        message: passwordValidation.message,
      });
    }

    const user = await User.findOne({
      emailId: emailValidation.sanitizedData,
    }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
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
      token: user.generateAuthToken(),
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({
      message: error.message || "Server error during login",
    });
  }
};
