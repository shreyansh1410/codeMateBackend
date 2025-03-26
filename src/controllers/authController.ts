import { Request, Response } from "express";
import User, { IUser } from "../models/User";
import validator from "validator";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, emailId, password, gender, age, skills, bio } =
      req.body;

    // Required fields validation
    if (!firstName || !emailId || !password) {
      return res.status(400).json({
        message: "Please provide all required fields",
        required: ["firstName", "emailId", "password"],
      });
    }

    // First name validation
    if (!validator.isLength(firstName, { min: 2, max: 30 })) {
      return res.status(400).json({
        message: "First name must be between 2 and 30 characters",
      });
    }

    // Last name validation (if provided)
    if (lastName && !validator.isLength(lastName, { max: 30 })) {
      return res.status(400).json({
        message: "Last name cannot exceed 30 characters",
      });
    }

    // Email validation
    if (!validator.isEmail(emailId)) {
      return res.status(400).json({
        message: "Please provide a valid email address",
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    // Password validation
    if (!validator.isLength(password, { min: 6, max: 30 })) {
      return res.status(400).json({
        message: "Password must be between 6 and 30 characters",
      });
    }

    // Age validation
    if (age) {
      const ageNum = Number(age);
      if (isNaN(ageNum) || ageNum < 18 || ageNum > 150) {
        return res.status(400).json({
          message: "Age must be between 18 and 150 years",
        });
      }
    }

    // Gender validation
    if (gender) {
      const validGenders = ["male", "female", "others", "prefer not to say"];
      if (!validGenders.includes(gender.toLowerCase())) {
        return res.status(400).json({
          message:
            "Gender must be one of: male, female, others, prefer not to say",
        });
      }
    }

    // Skills validation
    if (skills) {
      if (!Array.isArray(skills) || skills.length > 10) {
        return res.status(400).json({
          message: "Maximum 10 skills allowed",
        });
      }
      if (
        skills.some((skill: string) => !validator.isLength(skill, { max: 30 }))
      ) {
        return res.status(400).json({
          message: "Each skill cannot exceed 30 characters",
        });
      }
    }

    // Bio validation
    if (bio && !validator.isLength(bio, { max: 200 })) {
      return res.status(400).json({
        message: "Bio cannot exceed 200 characters",
      });
    }

    const userData: any = {
      firstName: validator.trim(firstName),
      lastName: lastName ? validator.trim(lastName) : undefined,
      emailId: validator.normalizeEmail(emailId),
      password,
    };

    if (gender) userData.gender = gender.toLowerCase();
    if (age) userData.age = Number(age);
    if (skills)
      userData.skills = skills.map((skill: string) => validator.trim(skill));
    if (bio) userData.bio = validator.trim(bio);

    const user = await User.create(userData);

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

    // Required fields validation
    if (!emailId || !password) {
      return res.status(400).json({
        message: "Please provide both email and password",
        required: ["emailId", "password"],
      });
    }

    // Email validation
    if (!validator.isEmail(emailId)) {
      return res.status(400).json({
        message: "Please provide a valid email address",
      });
    }

    // Password validation
    if (!validator.isLength(password, { min: 6, max: 30 })) {
      return res.status(400).json({
        message: "Password must be between 6 and 30 characters",
      });
    }

    const normalizedEmail = validator.normalizeEmail(emailId);
    const user = await User.findOne({ emailId: normalizedEmail }).select(
      "+password"
    );
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
