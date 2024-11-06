const http = require('http');
const WebSocket = require('ws');

// Create an HTTP server
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end();
});

// Create WebSocket server using the HTTP server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('A new client connected');

  ws.on('message', (message) => {
    // Convert the Buffer to a string, then parse it as JSON
    const parsedMessage = JSON.parse(message.toString());
    console.log('Received:', parsedMessage);
  
    // Broadcast the message to all clients except the sender
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(parsedMessage));
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Start the server on port 4000
server.listen(4000, () => {
  console.log('WebSocket server running on http://localhost:4000');
});
