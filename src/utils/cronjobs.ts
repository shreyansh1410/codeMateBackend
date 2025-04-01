import cron from "node-cron";
import Request from "../models/Request";
import { endOfDay, startOfDay, subDays } from "date-fns";
import mongoose from "mongoose"; // Ensure Mongoose types are available
import { run } from "../utils/sendEmail";

cron.schedule("0 8 * * *", async () => {
  try {
    const yesterday = subDays(new Date(), 1);
    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);

    const pendingRequests = await Request.find({
      status: "interested",
      createdAt: {
        $gte: yesterdayStart,
        $lte: yesterdayEnd,
      },
    }).populate<{
      fromUserId: { _id: mongoose.Types.ObjectId };
      toUserId: { _id: mongoose.Types.ObjectId };
    }>("fromUserId toUserId");

    if (!pendingRequests.length) {
      console.log("No requests found");
      return;
    }

    const toUsers = new Set<mongoose.Types.ObjectId>();
    pendingRequests.forEach((request) => {
      if (request.toUserId && request.toUserId._id) {
        toUsers.add(request.toUserId._id);
      }
    });

    const toUserArray = Array.from(toUsers);

    for (const user of toUserArray) {
      try {
        const res = await run(
          "Shreyansh From",
          "Shreyansh To",
          "Test Email",
          "This is a test email"
        );
      } catch (err) {
        console.error(
          "Error sending email",
          err instanceof Error ? err.message : err
        );
      }
    }

    console.log("Collected toUserIds:", Array.from(toUsers));
  } catch (err: unknown) {
    console.error("Cron Job Error:", err instanceof Error ? err.message : err);
  }

  console.log("Running scheduled task", new Date());
});
