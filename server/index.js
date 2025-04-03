const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const chatRooms = new Map();

wss.on('connection', (ws) => {
  ws.id = uuidv4();
  ws.isAlive = true;
  
  console.log('New client connected');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received message:', data);
      
      switch (data.type) {
        case 'join':
          handleJoin(ws, data);
          break;
        case 'leave':
          handleLeave(ws, data);
          break;
        case 'message':
          handleChatMessage(ws, data);
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
    chatRooms.forEach((users, roomName) => {
      const user = users.find(u => u.id === ws.id);
      if (user) {
        handleLeave(ws, {
          sender: user.username,
          room: roomName,
          timestamp: new Date().toISOString()
        });
      }
    });
  });
  
  ws.on('pong', () => {
    ws.isAlive = true;
  });
});

function handleJoin(ws, data) {
  const { sender, room, timestamp } = data;
  
  if (!chatRooms.has(room)) {
    chatRooms.set(room, []);
  }
  
  chatRooms.get(room).push({
    id: ws.id,
    username: sender,
    ws: ws
  });
  
  ws.room = room;
  ws.username = sender;
  
  console.log(`${sender} joined room: ${room}`);
  
  broadcastToRoom(room, {
    type: 'message',
    sender: 'System',
    text: `${sender} has joined the chat`,
    timestamp,
    system: true
  });
}

function handleLeave(ws, data) {
  const { sender, room, timestamp } = data;
  
  if (!chatRooms.has(room)) return;
  
  const users = chatRooms.get(room);
  const userIndex = users.findIndex(u => u.id === ws.id);
  
  if (userIndex !== -1) {
    users.splice(userIndex, 1);
    
    console.log(`${sender} left room: ${room}`);
    
    broadcastToRoom(room, {
      type: 'message',
      sender: 'System',
      text: `${sender} has left the chat`,
      timestamp,
      system: true
    });
    
    if (users.length === 0) {
      chatRooms.delete(room);
      console.log(`Room deleted: ${room}`);
    }
  }
}

function handleChatMessage(ws, data) {
  const { sender, text, timestamp } = data;
  const room = ws.room;
  
  if (!room || !chatRooms.has(room)) return;
  
  console.log(`Message in ${room} from ${sender}: ${text}`);
  
  broadcastToRoom(room, {
    type: 'message',
    sender,
    text,
    timestamp
  });
}

function broadcastToRoom(roomName, message) {
  if (!chatRooms.has(roomName)) return;
  
  const users = chatRooms.get(roomName);
  const messageStr = JSON.stringify(message);
  
  users.forEach(user => {
    if (user.ws.readyState === WebSocket.OPEN) {
      user.ws.send(messageStr);
    }
  });
}

const interval = setInterval(() => {
  wss.clients.forEach(ws => {
    if (ws.isAlive === false) return ws.terminate();
    
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', () => {
  clearInterval(interval);
});

app.get('/', (req, res) => {
  res.send('RetroChat server is running');
});

const PORT = process.env.PORT || 3000;

// Listen on all network interfaces, not just localhost
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`Server is accessible at http://YOUR_IP_ADDRESS:${PORT}`);
});