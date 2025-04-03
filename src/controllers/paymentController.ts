import { Request, Response } from "express";
import razorpayInstance from "../utils/razorpay";
import Payment from "../models/Payment";
import { membershipAmount } from "../utils/constants";

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

    console.log(order);

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

    console.log(payment);
    const savedPayment = await payment.save();

    return res.status(200).json({ ...savedPayment.toJSON(), keyId: rzpkeyid });
  } catch (err: any) {
    return res.status(500).json({ "error: ": err });
  }
};
