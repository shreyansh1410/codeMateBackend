import { Request, Response } from "express";
import User, { IUser } from "../models/User";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, emailId, password, gender, age, skills, bio } =
      req.body;

    if (!firstName || !lastName || !emailId || !password) {
      return res.status(400).json({
        message: "Please provide all required fields",
        required: ["firstName", "lastName", "emailId", "password"],
      });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(emailId)) {
      return res
        .status(400)
        .json({ message: "Please provide a valid email address" });
    }

    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const userData: any = {
      firstName,
      lastName,
      emailId,
      password,
    };

    if (gender) userData.gender = gender;
    if (age) userData.age = age;
    if (skills) userData.skills = skills;
    if (bio) userData.bio = bio;

    const user = await User.create(userData);

    if (user) {
      res.status(201).json(user);
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { emailId, password } = req.body;

    if (!emailId || !password) {
      return res.status(400).json({
        message: "Please provide both email and password",
        required: ["emailId", "password"],
      });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(emailId)) {
      return res
        .status(400)
        .json({ message: "Please provide a valid email address" });
    }

    const user = await User.findOne({ emailId }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      emailId: user.emailId,
      token: user.generateAuthToken(),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};
