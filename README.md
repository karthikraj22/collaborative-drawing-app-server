# Collaborative Drawing App - Server

This is the server component of the Collaborative Drawing App. It handles real-time communication between clients and manages the state of the collaborative drawing canvas.

## Features

- Real-time drawing synchronization
- User authentication and management
- Persistent storage of drawing sessions
- RESTful API for client interactions

## Requirements

- Node.js v14 or higher
- npm v6 or higher
- MongoDB

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/karthikraj22/collaborative-drawing-app-server.git
    cd collaborative-drawing-app/server
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Set up environment variables:
    Create a `.env` file in the root directory and add the following:
    ```
    PORT=3000
    ```

4. Start the server:
    ```sh
    npm start / 
    ```

## WebSocket Events

- `connection` - Establish a new WebSocket connection
- `drawing` - Broadcast drawing data to all connected clients
- `clear` - Clear the drawing canvas for all clients
- `disconnect` - Handle client disconnection

