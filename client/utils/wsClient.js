let socket = null;

export const connectToChat = (username, chatName) => {
  // Using your actual IP address
  const serverUrl = 'ws://192.168.244.197:3000';
  
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close();
  }
  
  socket = new WebSocket(serverUrl);
  
  socket.onopen = () => {
    const joinMessage = {
      type: 'join',
      sender: username,
      room: chatName,
      timestamp: new Date().toISOString()
    };
    
    socket.send(JSON.stringify(joinMessage));
  };
  
  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  return {
    socket,
    disconnect: () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        const leaveMessage = {
          type: 'leave',
          sender: username,
          room: chatName,
          timestamp: new Date().toISOString()
        };
        
        socket.send(JSON.stringify(leaveMessage));
        socket.close();
      }
    }
  };
};

export const sendMessage = (sender, text) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return;
  }
  
  const message = {
    type: 'message',
    sender,
    text,
    timestamp: new Date().toISOString()
  };
  
  socket.send(JSON.stringify(message));
};