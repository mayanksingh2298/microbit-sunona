// src/SignalingServer.js
let socket;

// Function to initialize the WebSocket connection
export function initWebSocketConnection(onMessage) {
  if (!socket || socket.readyState === WebSocket.CLOSED) {
    // socket = new WebSocket('ws://localhost:4000'); // Connect to the signaling server
    socket = new WebSocket('wss://microbit.rcher.me/ws'); // Connect to the signaling server

    socket.onopen = () => {
      console.log('Connected to WebSocket signaling server');
    };

    socket.onmessage = (event) => {
      console.log('Received message from server:', event.data);
      onMessage(JSON.parse(event.data)); // Parse and pass the message to callback
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };
  } else{
    // update the onmessage callback
    socket.onmessage = (event) => {
      console.log('Received message from server:', event.data);
      onMessage(JSON.parse(event.data)); // Parse and pass the message to callback
    };
  }
}

// Function to send messages to the server
export function sendSignal(data) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
    console.log('Sent message to server:', data);
  } else {
    console.warn('WebSocket is not open. Message not sent:', data);
  }
}
