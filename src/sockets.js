const { Server } = require("socket.io");

let users = {};

function setupWebSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // 🎯 Join Room
    socket.on("joinRoom", ({ username, room }) => {
      const joinTime = new Date().toLocaleTimeString();
      socket.join(room);
      users[socket.id] = { username, room, joinTime };

      console.log(`📢 ${username} joined room: ${room} at ${joinTime}`);

      const roomUsers = Object.values(users).filter((user) => user.room === room);
      io.to(room).emit("userList", roomUsers);
    });

    // 🎨 Drawing
    socket.on("draw", (drawData) => {
      const user = users[socket.id];
      if (!user) return;
      socket.to(user.room).emit("draw", drawData);
    });

    socket.on("resetCanvas", () => {
      const user = users[socket.id];
      if (!user) return;
      io.to(user.room).emit("resetCanvas");
    });

    // ✅ WebRTC for AUDIO
    socket.on("audioOffer", (offer) => {
      const user = users[socket.id];
      if (!user) return;
      console.log(`🎤 Audio offer from ${user.username}`);
      socket.to(user.room).emit("audioAnswer", offer);
    });

    socket.on("audioIceCandidate", (candidate) => {
      const user = users[socket.id];
      if (!user) return;
      console.log(`🎤 Audio ICE from ${user.username}`);
      socket.to(user.room).emit("audioIceCandidate", candidate);
    });

    // ✅ WebRTC for SCREEN SHARING
    socket.on("screenOffer", (offer) => {
      const user = users[socket.id];
      if (!user) return;
      console.log(`🖥️ Screen offer from ${user.username}`);
      socket.to(user.room).emit("screenAnswer", offer);
    });

    socket.on("screenIceCandidate", (candidate) => {
      const user = users[socket.id];
      if (!user) return;
      console.log(`🖥️ Screen ICE from ${user.username}`);
      socket.to(user.room).emit("screenIceCandidate", candidate);
    });

    socket.on("screenShareStopped", () => {
      const user = users[socket.id];
      if (!user) return;
      console.log(`🛑 Screen sharing stopped by ${user.username}`);
      socket.to(user.room).emit("screenShareStopped");
    });

    // 💬 Chat
    socket.on("chatMessage", (messageData) => {
      const user = users[socket.id];
      if (!user) return;

      const message = {
        username: user.username,
        message: messageData.message,
        type: "text",
        timestamp: new Date().toLocaleTimeString(),
      };

      io.to(user.room).emit("message", message);
    });

    // 🔊 Audio Message
    socket.on("audioMessage", (audioData) => {
      const user = users[socket.id];
      if (!user) return;

      const message = {
        username: user.username,
        message: audioData.audio,
        type: "audio",
        timestamp: new Date().toLocaleTimeString(),
      };

      io.to(user.room).emit("message", message);
    });

    // ❌ Disconnect
    socket.on("disconnect", () => {
      const user = users[socket.id];
      if (!user) return;

      const { room, username } = user;
      console.log(`❌ ${username} disconnected from room: ${room}`);
      delete users[socket.id];

      const roomUsers = Object.values(users).filter((u) => u.room === room);
      io.to(room).emit("userList", roomUsers);
    });
  });

  return io;
}

module.exports = { setupWebSocket };
