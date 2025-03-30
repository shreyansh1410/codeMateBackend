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
      data: receivedRequests.map((request) => request.fromUserId),
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
      //cant just compare without converting to string, it wont work
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

/* /feed?page=1&limit=10 */
export const getUserFeed = async (req: Request, res: Response) => {
  try {
    const pageNum = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    /*
      should not see:
      0. their own
      1. accepted
      2. interested
      3. rejected
      4. ignored
      basically anyone whom user has already interacted with and rest all should be seen
    */

    const loggedInUserId = req.user._id;

    // 1. Find all requests where the logged-in user is involved.
    const userRequests = await RequestModel.find({
      $or: [{ fromUserId: loggedInUserId }, { toUserId: loggedInUserId }],
    });

    // 2. Build a set of user IDs to exclude:
    //    - The to and from users from each request (includes the user itself)
    const exclusionUserIds = new Set<string>();
    exclusionUserIds.add(loggedInUserId);
    userRequests.forEach((request) => {
      const fromId = request.fromUserId.toString();
      const toId = request.toUserId.toString();

      exclusionUserIds.add(fromId);
      exclusionUserIds.add(toId);
    });

    // Convert the set to an array
    const exclusionUserIdsArr = Array.from(exclusionUserIds);

    // 3. Find users that are not in the exclusion list.
    const feedUsers = await UserModel.find({
      _id: { $nin: exclusionUserIdsArr },
    })
      .select(SAFE_USER_DATA)
      .skip((pageNum - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      msg: "Feed fetched successfully",
      data: feedUsers,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: "Error fetching user feed",
      message: err.message,
    });
  }
};
