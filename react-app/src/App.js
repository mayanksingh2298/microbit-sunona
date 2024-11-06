

// src/App.js
import React, { useEffect, useCallback } from 'react';
import { uBitConnectDevice, uBitDisconnect, uBitSend } from './ubitwebusb';
import { useMessageContext, MessageProvider } from './MessageContext';
import { initWebSocketConnection,sendSignal } from './SignalingServer';
import { CircularProgress } from '@mui/material';

function App() {
  const {
    user,
    setUser,
    peerConnected,
    setPeerConnected,
    peerMicrobitConnected,
    setPeerMicrobitConnected,
    lastMessageSent,
    setLastMessageSent,
    microbitConnected,
    setMicrobitConnected,
    connectedMicroBitDevice,
    setConnectedMicroBitDevice
  } = useMessageContext();

  // Handle incoming messages from WebSocket
  const handleServerMessage = useCallback((data) => {
    // on receiving a user_selected signal from peer, update the peer connected status
    if (data.type === 'user_selected' && data.user !== user) {
      setPeerConnected(data.user);

      // Reset the peer timeout since we just got a signal
      if (window.peerTimeout) {
        clearTimeout(window.peerTimeout);
      }
      window.peerTimeout = setTimeout(() => {
        console.log("TRIGGERING TIMEOUT - No signal received");
        setPeerConnected("");
      }, 5000);
    } 
    // on receiving a microbit_connected signal from peer, update the peer microbit connected status
    else if (data.type === 'microbit_connected') {
      setPeerMicrobitConnected(data.connected);

      // Reset the peer timeout since we just got a signal
      if (window.peerMicrobitTimeout) {
        clearTimeout(window.peerMicrobitTimeout);
      }
      window.peerMicrobitTimeout = setTimeout(() => {
        console.log("TRIGGERING TIMEOUT - No signal received");
        setPeerMicrobitConnected(false);
      }, 5000);
    }
    // on receiving a message signal from peer, send a message to the self microbit
    else if (data.type === 'message') {
      if (connectedMicroBitDevice) {
        uBitSend(connectedMicroBitDevice, data.content);
      }
    }
    // this is present in useCallBack because when connectedMicroBitDevice changes, the callback function should be updated
  }, [connectedMicroBitDevice, user, setPeerConnected, setPeerMicrobitConnected]);

  // updates handleServerMessage when connectedMicroBitDevice changes
  useEffect(() => {
    initWebSocketConnection(handleServerMessage);
    return () => {
    };
  }, [handleServerMessage]);

  // Effect for sending periodic user selected signal
  useEffect(() => {
    let interval;
    if (user) {
      interval = setInterval(() => {
        sendSignal({ type: 'user_selected', user });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [user]);

  // Effect for sending periodic microbit connected signal
  useEffect(() => {
    let interval;
    if (microbitConnected) {
      interval = setInterval(() => {
        sendSignal({ type: 'microbit_connected', connected: true });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [microbitConnected]);

  function uBitEventHandler(reason, device, data) {
    switch(reason) {
        case "connected":
            setConnectedMicroBitDevice(device)
            console.log("connected to microbit", device)
            setMicrobitConnected(true);
            sendSignal({ type: 'microbit_connected', connected: true });
            break
        case "disconnected":
            console.log("DISCONNECTED FROM MICROBIT")
            setConnectedMicroBitDevice(null)
            setMicrobitConnected(false);
            sendSignal({ type: 'microbit_connected', connected: false });
            break
        case "connection failure":
            console.log("CONNECTION FAILURE")
            break
      }
  }

  // Handle micro:bit connection simulation
  const handleConnectMicrobit = async () => {
    uBitConnectDevice(uBitEventHandler);
  }

  // Select user and send the selection to the server
  const selectUser = (selectedUser) => {
    if (peerConnected && peerConnected === selectedUser) {
      alert('This user is already connected. Please select a different user.');
      return;
    }
    if (!user) {
      setUser(selectedUser);
      sendSignal({ type: 'user_selected', user: selectedUser });
    }
  };

  // Send a message to the other user to be sent to the other user's microbit
  const sendMessage = (content) => {
    // const message = { type: 'message', content };
    setLastMessageSent(content);
    sendSignal({ type: 'message', content });
  };

  // Handle micro:bit disconnection simulation
  const handleDisconnectMicrobit = async () => {
    console.log("disconnected from microbit", connectedMicroBitDevice)
    uBitDisconnect(connectedMicroBitDevice)
  }

  // Send a message to the other user
  const handleSendMessage = (message) => {
    if (peerConnected && peerMicrobitConnected) {
      sendMessage(message);
    } else {
      alert('Waiting for the other user to connect...');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400">
      <div className="bg-white shadow-xl rounded-3xl p-8 max-w-md w-full transform transition-all hover:scale-105">
        <h1 className="text-3xl font-bold text-purple-600 text-center mb-6 animate-bounce [animation-duration:3000ms]">
          BuzzBuddy 🎀
        </h1>
        {!user ? (
          <div className="flex justify-center space-x-4 mb-4">
            <button className="bg-pink-400 hover:bg-pink-500 text-white font-bold py-2 px-6 rounded-full transition duration-300" onClick={() => selectUser('Mayank')}>Mayank</button>
            <button className="bg-purple-400 hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-full transition duration-300" onClick={() => selectUser('Sunanda')}>Sunanda</button>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl text-center text-purple-500 font-semibold">Welcome, {user}!</h2>
            <div className="flex flex-col items-center space-y-4">
              <p className="text-lg text-purple-700 font-medium">Micro:bit Status:</p>
              {!microbitConnected ? (
                <button className="bg-indigo-400 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-full transition duration-300" onClick={handleConnectMicrobit}>Connect Micro:bit</button>
              ) : (
                <button className="bg-red-400 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-full transition duration-300" onClick={handleDisconnectMicrobit}>Disconnect Micro:bit</button>
              )}
            </div>
            <div className="text-center space-y-4">
              <p className="text-lg text-purple-700 font-medium">Messaging</p>
              {peerConnected && peerMicrobitConnected ? (
                <div className="flex flex-col space-y-2">
                  <button className="bg-green-400 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-full transition duration-300 w-fit mx-auto" onClick={() => handleSendMessage('heart')}>💖</button>
                  <button className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-full transition duration-300 w-fit mx-auto" onClick={() => handleSendMessage('note')}>🎵</button>
                  <button className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-6 rounded-full transition duration-300 w-fit mx-auto" onClick={() => handleSendMessage('star')}>⭐</button>
                  <button className="bg-purple-400 hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-full transition duration-300 w-fit mx-auto" onClick={() => handleSendMessage('smile')}>😊</button>
                  <button className="bg-purple-400 hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-full transition duration-300 w-fit mx-auto" onClick={() => handleSendMessage('flower')}>🌸</button>
                  <button className="bg-purple-400 hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-full transition duration-300 w-fit mx-auto" onClick={() => handleSendMessage('kiss')}>💋</button>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2 text-purple-500">
                  <CircularProgress size={24} color="inherit" />
                  <p className="text-md">Waiting for the other user to connect...</p>
                </div>
              )}
              {lastMessageSent && (
                <p className="text-lg text-purple-600 font-semibold mt-4">Last Message: {lastMessageSent}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



// Wrap the app with the MessageProvider to provide context
export default function WrappedApp() {
  return (
    <MessageProvider>
      <App />
    </MessageProvider>
  );
}
