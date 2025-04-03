import { Request, Response } from "express";
import User, { IUser } from "../models/User";
import {
  validateUserRegistration,
  validateEmail,
  validatePassword,
} from "../utils/validators";
import { sendWelcomeEmail } from "../utils/emailService";

const cookieOptions = {
  httpOnly: true,
  sameSite: "none" as const,
  secure: true,
  maxAge: 24 * 60 * 60 * 1000 * 7,
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const validationResult = validateUserRegistration(req.body);
    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        message: validationResult.message,
      });
    }

    const { emailId } = validationResult.sanitizedData;

    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const user = await User.create(validationResult.sanitizedData);

    // Send welcome email
    await sendWelcomeEmail(user.emailId, user.firstName);

    const token = user.generateAuthToken();

    res.cookie("token", token, cookieOptions);

    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      emailId: user.emailId,
      age: user.age,
      gender: user.gender,
      skills: user.skills,
      bio: user.bio,
      photoURL: user.photoURL,
    };

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userResponse,
      token,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Error registering user",
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { emailId, password } = req.body;

    // Validate email and password
    const emailValidation = validateEmail(emailId);
    if (!emailValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: emailValidation.message,
      });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message,
      });
    }

    const user = await User.findOne({ emailId }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = user.generateAuthToken();

    res.cookie("token", token, cookieOptions);

    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      emailId: user.emailId,
      age: user.age,
      gender: user.gender,
      skills: user.skills,
      bio: user.bio,
      photoURL: user.photoURL,
    };

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: userResponse,
      token,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Error logging in",
    });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token");
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Error logging out",
    });
  }
};
