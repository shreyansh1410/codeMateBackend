import express from "express";
import User, { IUser } from "../models/User";
import validator from "validator";

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

  if (!validator.isEmail(emailId)) {
    return res
      .status(400)
      .json({ message: "Please provide a valid email address" });
  }

  try {
    const normalizedEmail = validator.normalizeEmail(emailId);
    const user = await User.findOne({ emailId: normalizedEmail }).select(
      "-password"
    );
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

  if (!validator.isMongoId(id)) {
    return res.status(400).json({ message: "Invalid user ID format" });
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

  if (!validator.isMongoId(userId)) {
    return res.status(400).json({ message: "Invalid user ID format" });
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

  if (!validator.isMongoId(userId)) {
    return res.status(400).json({ message: "Invalid user ID format" });
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

    // Validate skills array length if it's being updated
    if (userData.skills) {
      if (!Array.isArray(userData.skills) || userData.skills.length > 10) {
        return res.status(400).json({ message: "Maximum 10 skills allowed" });
      }
      if (
        userData.skills.some(
          (skill: string) => !validator.isLength(skill, { max: 30 })
        )
      ) {
        return res
          .status(400)
          .json({ message: "Each skill cannot exceed 30 characters" });
      }
      // Trim each skill
      userData.skills = userData.skills.map((skill: string) =>
        validator.trim(skill)
      );
    }

    // Validate bio length if it's being updated
    if (userData.bio) {
      if (!validator.isLength(userData.bio, { max: 200 })) {
        return res
          .status(400)
          .json({ message: "Bio cannot exceed 200 characters" });
      }
      userData.bio = validator.trim(userData.bio);
    }

    // Validate photoURL if it's being updated
    if (userData.photoURL) {
      if (!validator.isURL(userData.photoURL)) {
        return res
          .status(400)
          .json({ message: "Photo URL must be a valid HTTP/HTTPS URL" });
      }
    }

    // Validate and sanitize other fields
    if (userData.firstName) {
      if (!validator.isLength(userData.firstName, { min: 2, max: 30 })) {
        return res
          .status(400)
          .json({ message: "First name must be between 2 and 30 characters" });
      }
      userData.firstName = validator.trim(userData.firstName);
    }

    if (userData.lastName) {
      if (!validator.isLength(userData.lastName, { max: 30 })) {
        return res
          .status(400)
          .json({ message: "Last name cannot exceed 30 characters" });
      }
      userData.lastName = validator.trim(userData.lastName);
    }

    if (userData.age) {
      const ageNum = Number(userData.age);
      if (isNaN(ageNum) || ageNum < 18 || ageNum > 150) {
        return res
          .status(400)
          .json({ message: "Age must be between 18 and 150 years" });
      }
      userData.age = ageNum;
    }

    if (userData.gender) {
      const validGenders = ["male", "female", "others", "prefer not to say"];
      if (!validGenders.includes(userData.gender.toLowerCase())) {
        return res.status(400).json({
          message:
            "Gender must be one of: male, female, others, prefer not to say",
        });
      }
      userData.gender = userData.gender.toLowerCase();
    }

    const user = await User.findByIdAndUpdate(userId, userData, {
      new: true,
      runValidators: true,
    });

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
