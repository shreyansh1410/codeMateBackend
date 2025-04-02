import { Request, Response } from "express";
import Chat from "../models/Chat";

export const getChat = async (req: Request, res: Response) => {
  const { targetUserId } = req.params;
  const currUserId = req.user._id;

  try {
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
