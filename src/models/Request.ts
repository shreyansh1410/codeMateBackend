import mongoose, { Model, Schema } from "mongoose";

const RequestSchema = new Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      message: "fromUserId is not provided or invalid",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      message: "toUserId is not provided or invalid",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "interested", "ignored", "accepted", "rejected"],
      message: "Please provide a valid status request",
    },
  },
  {
    timestamps: true,
  }
);

RequestSchema.pre("save", function (next) {
  const request = this;
  if (request.fromUserId.equals(request.toUserId)) {
    throw new Error("You cannot send request to yourself");
  }
  next();
});

export default mongoose.model("RequestModel", RequestSchema);
