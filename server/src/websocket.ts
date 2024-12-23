import { ConnectedParticipants } from "./database/schemas/ConnectedParticipants";
import { Message } from "./database/schemas/Message";
import { PendingRequests } from "./database/schemas/PendingRequests";
import { io } from "./http";

io.on("connection", (socket) => {
  socket.on("userConnectInRoom", async (data, callback) => {
    console.log("🚩 listen: userConnect -> ", data);

    socket.join(data.room);

    await ConnectedParticipants.create({
      name: data.name,
      room: data.room,
      socket_id: socket.id,
      isHost: data.isHost,
    });

    const roomMessages = await Message.find({
      room: data.room,
    });

    if (data.isHost) {
      const pendingRequests = await PendingRequests.find({
        requestStatus: "waiting",
        room: data.room,
      });

      callback({
        messages: roomMessages,
        pendingRequests,
      });
    } else {
      callback({
        messages: roomMessages,
        pendingRequests: [],
      });
    }
  });

  socket.on("newMessageToServer", async (data) => {
    console.log("🚩 listen: newMessage -> ", data);

    const newMessage = await Message.create({
      socket_id: socket.id,
      room: data.room,
      name: data.name,
      text: data.text,
    });

    io.to(data.room).emit("newMessageToClient", newMessage);
  });

  socket.on("disconnect", async () => {
    console.log("🚩 listen: disconnect");

    await ConnectedParticipants.deleteOne({
      socket_id: socket.id,
    });
  });

  socket.on("guestAccessRequestToServer", async (data) => {
    console.log("🚩 guestAccessRequestToServer -> ", data);
    const host = await ConnectedParticipants.findOne({
      room: data.room,
      isHost: true,
    });

    await PendingRequests.create({
      socket_id: socket.id,
      room: data.room,
      name: data.userName,
      requestStatus: "waiting",
    });

    if (host) io.to(host.socket_id).emit("guestAccessRequest", data);
  });

  socket.on("hostAccessResponseToServer", async (data) => {
    console.log("🚩 hostAccessResponseToServer -> ", data);

    await PendingRequests.findOneAndUpdate(
      {
        socket_id: data.guestSocketId,
        room: data.room,
      },
      {
        requestStatus: data.response,
      }
    );

    io.to(data.guestSocketId).emit("hostAccessResponseToClient", data);
  });

  socket.on("pendingRequestsToServer", async (data) => {
    console.log("🚩 pendingRequests");
    const host = await ConnectedParticipants.findOne({
      room: data.room,
      isHost: true,
    });

    const pendingRequests = await PendingRequests.find({
      requestStatus: "waiting",
      room: data.room,
    });

    if (host)
      io.to(host.socket_id).emit("pendingRequestsToClient", pendingRequests);
  });
});
