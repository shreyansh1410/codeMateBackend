import { Request, Response } from "express";
import RequestModel from "../models/Request";
import UserModel from "../models/User";

export const sendRequest = async (req: Request, res: Response) => {
  try {
    const fromUserId = req.user._id;
    const status = req.params.status;

    const allowedStatus = ["ignored", "interested"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ err: "Invalid status" });
    }

    const toUserId = req.params.toUserId;

    if (fromUserId === toUserId) {
      return res
        .status(500)
        .json({ message: "Cannot send request to yourself" });
    }
    const toUser = await UserModel.findById(toUserId);
    if (!toUser) {
      return res.status(404).json({ err: "toUser not found" });
    }

    const existingRequest = await RequestModel.findOne({
      $or: [
        { fromUserId, toUserId },
        {
          fromUserId: toUserId,
          toUserId: fromUserId,
        },
      ],
    });
    if (existingRequest) {
      return res.status(400).json({ err: "Request already sent" });
    }

    const request = new RequestModel({
      fromUserId,
      toUserId,
      status,
    });

    const data = await request.save();
    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(500).json({
      error: "Error while sending connection request",
      message: err.message,
    });
  }
};

export const reviewRequest = async (req: Request, res: Response) => {
  try {
    const currUserId = req.user._id;
    const { status, requestId } = req.params;

    const allowedStatus = ["accepted", "rejected"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ err: "Invalid review status" });
    }

    const request = await RequestModel.findOne({
      _id: requestId,
      toUserId: currUserId,
      status: "interested",
    });

    if (!request) {
      return res.status(404).json({ err: "Request not found" });
    }

    request.status = status as "accepted" | "rejected";
    const data = await request.save();
    return res.status(200).json({
      msg: `Connection requested ${status} successfully`,
      data,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: "Error while reviewing connection request",
      message: err.message,
    });
  }
};
