import { Request, Response } from "express";
import razorpayInstance from "../utils/razorpay";
import Payment from "../models/Payment";
import { membershipAmount } from "../utils/constants";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils";
import User from "../models/User";

export const createPayment = async (req: Request, res: Response) => {
  try {
    const { planType: type } = req.body;
    const user = req.user;
    const firstName = user?.firstName;
    const lastName = user?.lastName;
    const emailId = user?.emailId;
    const rzpkeyid = process.env.RAZORPAY_KEY_ID;
    const order = await razorpayInstance.orders.create({
      amount: membershipAmount[type as keyof typeof membershipAmount] * 100, // Amount is in currency subunits (paise in India)
      currency: "INR",
      receipt: "order_rcptid_11",
      notes: {
        firstName,
        lastName,
        emailId,
        planType: type,
      },
    });

    // console.log(order);

    const payment = new Payment({
      userId: req.user._id,
      // paymentId: order.paymentId,
      orderId: order.id,
      notes: order.notes,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
    });

    // console.log(payment);
    const savedPayment = await payment.save();

    return res.status(200).json({ ...savedPayment.toJSON(), keyId: rzpkeyid });
  } catch (err: any) {
    return res.status(500).json({ "error: ": err });
  }
};

export const webhook = async (req: Request, res: Response) => {
  try {
    const rawWebhookSignature = req.headers["x-razorpay-signature"];

    if (!rawWebhookSignature) {
      throw new Error("Webhook signature is missing");
    }

    const webhookSignature = Array.isArray(rawWebhookSignature)
      ? rawWebhookSignature[0]
      : rawWebhookSignature;

    const isWebHookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET ?? ""
    );

    if (!isWebHookValid) {
      return res
        .status(400)
        .json({ error: "Webhook signature verification failed" });
    }

    //update payment status in DB
    const paymentDetails = req.body.payload.payment.entity;
    const payment = await Payment.findOne({ orderId: paymentDetails.order_id });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }
    payment.status = paymentDetails.status;
    await payment.save();
    //Update the user as premium

    const user = await User.findById(payment.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.isPremium = true;
    user.membershipType = (payment.notes ?? {}).planType ?? "free";
    await user.save();

    //webhook is verified check if the payment is valid or not

    res.status(200).json({ received: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Webhook signature verification failed" });
  }
};

export const verify = async (req: Request, res: Response) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res
      .status(404)
      .json({ error: "User not found in verification of payment" });
  }
  if (user.isPremium) {
    return res.status(200).json({ isPremium: true });
  }
  return res.status(200).json({ isPremium: false });
};
