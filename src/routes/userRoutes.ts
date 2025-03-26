import express from "express";
import User, { IUser } from "../models/User";

const router = express.Router();

//api to get all user from DB
router.get("/feed", async (req, res) => {
  try {
    const users: Array<IUser> = await User.find({});
    if (!users) res.status(404).send("No users found");
    res.json(users);
  } catch (err) {
    res.status(400).send("Something went wrong while fetching all users");
  }
});

//get a single user by emailId
router.get("/user", async (req, res) => {
  const userEmail = req.body.emailId;
  const userId = req.body.id;
  try {
    const user = await User.findOne({ emailId: userEmail });
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      emailId: user.emailId,
      age: user.age,
      gender: user.gender,
      skills: user.skills,
      bio: user.bio,
    });
  } catch (err) {
    res.status(400).send("Something went wrong while fetching a single user");
  }
});

//get user by ID
router.get("/user:id", async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findById(id);
    if (!user) {
      res.status(404).send({ message: "user not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ "Something went wrong in finding by ID": err });
  }
});

//delete user  by Id
router.delete("/user", async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findByIdAndDelete(userId, { new: true });
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ err: "Somehting went wrong while deleting" });
  }
});

//update user
router.patch("/user", async (req, res) => {
  const { userId, ...userData } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }
  try {
    const user = await User.findByIdAndUpdate(userId, userData, {
      new: true,
      runValidators: true,
    });
    if (!user) res.status(404).json({ message: "user not found" });
    res.status(200).json({ message: "User updated successfully" });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: err.message || "Something went wrong while updating" });
  }
});

export default router;
