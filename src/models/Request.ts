import mongoose, { Model, Schema } from "mongoose";
import User from "./User";

const RequestSchema = new Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      message: "fromUserId is not provided or invalid",
      required: true,
      ref: User,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      message: "toUserId is not provided or invalid",
      required: true,
    },
    status: {
      type: String,
      enum: ["interested", "ignored", "accepted", "rejected"],
      message: "Please provide a valid status request",
    },
  },
  {
    timestamps: true,
  }
);

RequestSchema.pre("save", function (next) {
  const request = this;
  if (request.fromUserId === request.toUserId)
    return next(new Error("You cannot send request to yourself"));
  next();
});

export default mongoose.model("RequestModel", RequestSchema);
