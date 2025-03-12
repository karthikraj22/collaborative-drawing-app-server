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
