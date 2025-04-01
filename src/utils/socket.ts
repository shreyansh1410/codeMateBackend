import { Server } from "socket.io";
import crypto from "crypto";

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
      ({ sendingUser, userId, targetUserId, receivingUser }) => {
        //create a room with participants
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
      ({ sendingUser, text, userId, targetUserId, receivingUser }) => {
        let roomId = [userId, targetUserId].sort().join("_");
        roomId = createSecretRoomId(roomId);
        console.log(
          `${text} sent by ${sendingUser} to ${receivingUser} has been received by targetUserId`
        );
        io.to(roomId).emit("receiveMessage", {
          sendingUser,
          text,
          userId,
          targetUserId,
          receivingUser,
        });
      }
    );
  });
};
