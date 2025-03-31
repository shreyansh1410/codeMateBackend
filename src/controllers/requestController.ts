import { Request, Response } from "express";
import RequestModel from "../models/Request";
import UserModel from "../models/User";
import { run } from "../utils/sendEmail";

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

    const fromUser = await UserModel.findById(fromUserId);
    if (!fromUser) {
      return res.status(404).json({ err: "fromUser not found" });
    }

    const request = new RequestModel({
      fromUserId,
      toUserId,
      status,
    });

    const data = await request.save();

    // Send email notification
    try {
      const subject = `New request from ${fromUser?.firstName} ${fromUser?.lastName}`;
      const body = `<h2>New Connection Request</h2>
                   <p>Hello ${toUser?.firstName},</p>
                   <p>You have received a new connection request from ${fromUser?.firstName} ${fromUser?.lastName}.</p>
                   <p>Login to your CodeMate account to accept or reject this request.</p>
                   <p>Best regards,<br>The CodeMate Team</p>`;
      
      const emailRes = await run("shreyansh.14010@gmail.com", "noreply@codemate.diy", subject, body);
      
      console.log("Email sending result:", emailRes);
      
      return res.status(200).json({
        ...data.toObject(),
        emailSent: emailRes.success
      });
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Still return success for the connection request, just note email failed
      return res.status(200).json({
        ...data.toObject(),
        emailSent: false,
        emailError: emailError instanceof Error ? emailError.message : String(emailError)
      });
    }
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
