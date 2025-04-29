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

    // 🎯 Handle user joining a room
    socket.on("joinRoom", ({ username, room }) => {
      const joinTime = new Date().toLocaleTimeString();
      socket.join(room);
      users[socket.id] = { username, room, joinTime };

      console.log(`📢 ${username} joined room: ${room} at ${joinTime}`);

      const roomUsers = Object.values(users).filter((user) => user.room === room);
      io.to(room).emit("userList", roomUsers);
      console.log("🔄 Updated Users in Room:", roomUsers);
    });

    socket.on("draw", (drawData) => {
      const user = users[socket.id];
      if (!user) return console.warn(`❌ No user for socket ID: ${socket.id}`);
      const { room } = user;

      // Broadcast to everyone else in the room except sender
      socket.to(room).emit("draw", drawData);
        // console.log(`🎨 Draw data from ${user.username} in room ${room}`, drawData);
    });

    socket.on("resetCanvas", () => {
      const user = users[socket.id];
      if (!user) return console.warn(`❌ No user for socket ID: ${socket.id}`);
      const { room, username } = user;

      console.log(`🧹 ${username} requested canvas reset in room ${room}`);

      // Broadcast resetCanvas event to all clients in the room
      io.to(room).emit("resetCanvas");
    });


    // 📡 WebRTC signaling events
    socket.on("sendOffer", (offer) => {
      const user = users[socket.id];
      if (!user) return console.warn(`❌ No user found for socket ID: ${socket.id}`);
      const { room, username } = user;
      console.log(`📨 Offer from ${username} in room ${room}`);
      socket.to(room).emit("receiveOffer", offer);
    });

    socket.on("sendAnswer", (answer) => {
      const user = users[socket.id];
      if (!user) return console.warn(`❌ No user found for socket ID: ${socket.id}`);
      const { room, username } = user;
      console.log(`📨 Answer from ${username} in room ${room}`);
      socket.to(room).emit("receiveAnswer", answer);
    });

    socket.on("sendIceCandidate", (candidate) => {
      const user = users[socket.id];
      if (!user) return console.warn(`❌ No user found for socket ID: ${socket.id}`);
      const { room, username } = user;
      console.log(`📡 ICE candidate from ${username} in room ${room}:`, candidate);
      socket.to(room).emit("receiveIceCandidate", candidate);
    });

    // 💬 Text chat
    socket.on("chatMessage", (messageData) => {
      const user = users[socket.id];
      if (!user) return console.warn(`❌ No user for socket ID: ${socket.id}`);
      const { room, username } = user;

      const message = {
        username,
        message: messageData.message,
        type: "text",
        timestamp: new Date().toLocaleTimeString(),
      };

      io.to(room).emit("message", message);
      console.log("💬 Message sent:", message);
    });

    // 🔊 Audio message
    socket.on("audioMessage", (audioData) => {
      const user = users[socket.id];
      if (!user) return console.warn(`❌ No user for socket ID: ${socket.id}`);
      const { room, username } = user;

      const message = {
        username,
        message: audioData.audio,
        type: "audio",
        timestamp: new Date().toLocaleTimeString(),
      };

      io.to(room).emit("message", message);
      console.log("🔊 Audio message sent:", message);
    });

    // 🔌 User disconnect
    socket.on("disconnect", () => {
      const user = users[socket.id];
      if (!user) return;

      const { room, username } = user;
      console.log(`❌ ${username} disconnected from room: ${room}`);

      delete users[socket.id];

      const roomUsers = Object.values(users).filter((user) => user.room === room);
      io.to(room).emit("userList", roomUsers);
      console.log("🔄 Updated Users in Room After Disconnect:", roomUsers);
    });
  });

  return io;
}

module.exports = { setupWebSocket };
