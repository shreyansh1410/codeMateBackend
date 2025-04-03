import mongoose, { Schema } from "mongoose";

const paymentSchema = new Schema({
  paymentId: {
    type: String,
    //optional
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  orderId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  receipt: {
    type: String,
    required: true,
  },
  notes: {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    emailId: {
      type: String,
    },
    planType: {
      type: String,
    },
  },
  status: {
    type: String,
    required: true,
  },
});

export default mongoose.model("PaymentModel", paymentSchema);
