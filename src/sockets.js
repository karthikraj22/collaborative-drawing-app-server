const { Server } = require("socket.io");

let users = {}; 

function setupWebSocket(server) {
    const io = new Server(server, {
        cors: { origin: "*" }  
    });

    io.on("connection", (socket) => {
        console.log(`✅ User connected: ${socket.id}`);

        // Handle User Joining a Room
        socket.on("joinRoom", ({ username, room }) => { 
            const joinTime = new Date().toLocaleTimeString();
            socket.join(room);
            users[socket.id] = { username, room, joinTime };
        
            console.log(`📢 ${username} joined room: ${room} at ${joinTime}`);
            
            // Send updated user list to room
            const roomUsers = Object.values(users).filter(user => user.room === room);
            io.to(room).emit("userList", roomUsers);
            console.log("🔄 Updated Users in Room:", roomUsers);
        });

        // Handle Real-Time Drawing
        socket.on("draw", (data) => {
            if (users[socket.id]) {
                socket.to(users[socket.id].room).emit("draw", data);
            }
        });

        // Handle Canvas Reset
        socket.on("resetCanvas", () => {
            if (users[socket.id]) {
                io.to(users[socket.id].room).emit("resetCanvas");
            }
        });

        socket.on('liveAudio', (audioData) => {
            console.log('Received live audio data from', socket.id);
          
            // Convert Buffer to Uint8Array before sending it to the frontend
            if (audioData && audioData.audio instanceof Buffer) {
              const audioArray = new Uint8Array(audioData.audio);  // Convert Buffer to Uint8Array
              console.log('Audio data as Uint8Array:', audioArray);
          
              // Emit the audio data (Uint8Array) to the room
              if (users[socket.id]) {
                const { room } = users[socket.id];
                socket.to(room).emit('liveAudio', { audio: audioArray });
              }
            }
          });
          

        // Handle Chat Message
        socket.on("chatMessage", (messageData) => {
            console.log("Message Received",messageData);
            
            if (users[socket.id]) {
                const { room } = users[socket.id];
                const message = {
                    username: users[socket.id].username,
                    message: messageData.message,
                    type: "text",
                    timestamp: new Date().toLocaleTimeString()
                };
                io.to(room).emit("message", message);
            }
        });

        // Handle Audio Message
        socket.on("audioMessage", (audioData) => {
            console.log("audio Data",audioData);
            console.log(users);
            
            if (users[socket.id]) {
                const { room } = users[socket.id];
                const message = {
                    username: users[socket.id].username,    
                    message: audioData.audio,
                    type: "audio",
                    timestamp: new Date().toLocaleTimeString()
                };
                console.log("Emit Message",message);
                
                io.to(room).emit("message", message);
            }
        });

        // Handle User Disconnection
        socket.on("disconnect", () => {
            if (users[socket.id]) {
                let room = users[socket.id].room;
                let username = users[socket.id].username;
        
                console.log(`❌ ${username} left room: ${room}`);
        
                delete users[socket.id];
                
                const roomUsers = Object.values(users).filter(user => user.room === room);
                io.to(room).emit("userList", roomUsers);
                console.log("🔄 Updated Users in Room After Disconnect:", roomUsers);
            }
        });
    });

    return io;
}

module.exports = { setupWebSocket };
