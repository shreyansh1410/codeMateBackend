import { Request, Response } from "express";
import RequestModel from "../models/Request";
import UserModel from "../models/User";

const SAFE_USER_DATA = "firstName lastName photoURL bio skills";

export const getReceivedRequests = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;

    const receivedRequests = await RequestModel.find({
      toUserId: userId,
      status: "interested",
    }).populate("fromUserId", SAFE_USER_DATA);

    return res.status(200).json({
      success: true,
      count: receivedRequests.length,
      data: receivedRequests,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: "Error fetching received requests",
      message: err.message,
    });
  }
};

export const getUserConnections = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;

    const connections = await RequestModel.find({
      $or: [
        { fromUserId: userId, status: "accepted" },
        { toUserId: userId, status: "accepted" },
      ],
    })
      .populate("fromUserId", SAFE_USER_DATA)
      .populate("toUserId", SAFE_USER_DATA);

    const connectedUsers = connections.map((connection) => {
      return connection.fromUserId._id.toString() === userId.toString()
        ? connection.toUserId // If logged-in user is sender, get recipient
        : connection.fromUserId; // If logged-in user is recipient, get sender
    });

    return res.status(200).json({
      success: true,
      count: connectedUsers.length,
      data: connectedUsers,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: "Error fetching connections",
      message: err.message,
    });
  }
};

export const getUserFeed = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;

    // Find all requests where the current user is involved
    const existingRequests = await RequestModel.find({
      $or: [{ fromUserId: userId }, { toUserId: userId }],
    });

    // Extract the user IDs from existing requests
    const existingUserIds = existingRequests.flatMap((request) => [
      request.fromUserId.toString(),
      request.toUserId.toString(),
    ]);

    // Add the current user's ID to the exclusion list
    const excludeUserIds = [
      ...new Set([...existingUserIds, userId.toString()]),
    ];

    // Find users who are not in the exclusion list
    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Optional filters
    const filters: any = {};

    // Add skill filter if provided
    if (req.query.skills) {
      const skillsArray = (req.query.skills as string).split(",");
      filters.skills = { $in: skillsArray };
    }

    // Add gender filter if provided
    if (req.query.gender) {
      filters.gender = req.query.gender;
    }

    // Find users based on filters and pagination
    const users = await UserModel.find({
      _id: { $nin: excludeUserIds },
      ...filters,
    })
      .select("firstName lastName emailId photoURL bio skills gender")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get total count for pagination
    const total = await UserModel.countDocuments({
      _id: { $nin: excludeUserIds },
      ...filters,
    });

    return res.status(200).json({
      success: true,
      count: users.length,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      data: users,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: "Error fetching user feed",
      message: err.message,
    });
  }
};
