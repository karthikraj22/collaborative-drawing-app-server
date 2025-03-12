require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { setupWebSocket } = require('./sockets');

const app = express();
app.use(cors());

const server = http.createServer(app);
setupWebSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
