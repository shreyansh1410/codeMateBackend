import { Request, Response } from "express";
import Chat from "../models/Chat";
import RequestModel from "../models/Request";

export const getChat = async (req: Request, res: Response) => {
  const { targetUserId } = req.params;
  const currUserId = req.user._id;

  try {
    const requestStatus = await RequestModel.find({
      $or: [
        { fromUserId: currUserId, toUserId: targetUserId },
        { fromUserId: targetUserId, toUserId: currUserId },
      ],
      status: "accepted",
    });

    if (!requestStatus || requestStatus.length === 0) {
      return res.status(401).json({
        message:
          "You cannot chat with this user because they are not your friend",
      });
    }

    let chat = await Chat.findOne({
      participants: { $all: [targetUserId, currUserId] },
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName",
    });

    return res.status(200).json(chat);
  } catch (err) {
    console.error(err);
  }
};
