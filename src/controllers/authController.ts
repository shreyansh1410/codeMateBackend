import { Request, Response } from "express";
import User, { IUser } from "../models/User";
import {
  validateUserRegistration,
  validateEmail,
  validatePassword,
} from "../utils/validators";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
};

const generateAuthToken = (userId: string): string => {
  const JWT_SECRET = process.env.JWT_SECRET!;
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: "24h",
  });
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

    // Check if user already exists
    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(
      validationResult.sanitizedData.password,
      salt
    );

    // Create user with hashed password
    const user = await User.create({
      ...validationResult.sanitizedData,
      password: hashedPassword,
    });

    // Create user response without password
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

    // Find user and include password field
    const user = await User.findOne({ emailId }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const uid: any = user._id;
    const token = generateAuthToken(uid.toString());

    // Set token in cookie
    res.cookie("token", token, cookieOptions);

    // Create user response without password
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
    res.clearCookie("token", cookieOptions);
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
