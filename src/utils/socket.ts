import { Server } from "socket.io";
import crypto from "crypto";
import Chat from "../models/Chat";
import Request from "../models/Request";

const createSecretRoomId = (roomId: string) => {
  return crypto.createHash("sha256").update(roomId).digest("hex");
};

export const intializeSocket = (server: any) => {
  const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://3.108.220.117",
        "http://localhost:5000",
        "https://codemate.diy",
        "http://codemate.diy",
      ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
    },
  });

  io.on("connection", (socket) => {
    // Handle events
    socket.on(
      "joinChat",
      async ({ sendingUser, userId, targetUserId, receivingUser }) => {
        //create a room with participants
        const requestStatus = await Request.find({
          $or: [
            { fromUserId: userId, toUserId: targetUserId },
            { fromUserId: targetUserId, toUserId: userId },
          ],
          status: "accepted",
        });

        if (!requestStatus) {
          throw new Error("You cannot send message to this user");
        }
        let roomId = [userId, targetUserId].sort().join("_");
        roomId = createSecretRoomId(roomId);
        console.log(`${sendingUser} has joined the room: `, roomId);
        socket.join(roomId);
      }
    );
    socket.on(
      "disconnet",
      ({ sendingUser, text, userId, targetUserId, receivingUser }) => {
        let roomId = [userId, targetUserId].sort().join("_");
        roomId = createSecretRoomId(roomId);
        console.log(`${sendingUser} has left the room: `, roomId);
        socket.leave(roomId);
      }
    );
    socket.on(
      "sendMessage",
      async ({ sendingUser, text, userId, targetUserId, receivingUser }) => {
        try {
          let roomId = [userId, targetUserId].sort().join("_");
          roomId = createSecretRoomId(roomId);
          // two options: either the chat is already present so just append to it or
          // create a new chat and save it
          const chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });
          if (!chat) {
            const newChat = new Chat({
              participants: [userId, targetUserId],
              messages: [
                {
                  senderId: userId,
                  text,
                },
              ],
            });
            await newChat.save();
          } else {
            chat.messages.push({
              senderId: userId,
              text,
            });
            await chat.save();
          }

          io.to(roomId).emit("receiveMessage", {
            sendingUser,
            text,
            userId,
            targetUserId,
            receivingUser,
          });
        } catch (err) {
          console.error(err);
        }
      }
    );
  });
};
