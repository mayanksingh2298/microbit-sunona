// src/MessageContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
const MessageContext = createContext();

export function MessageProvider({ children }) {
  // self status
  const [user, setUser] = useState(null);  // 'Mayank' or 'Sunanda'
  const [microbitConnected, setMicrobitConnected] = useState(false); // Micro:bit connection status

  const [connectedMicroBitDevice, setConnectedMicroBitDevice] = useState(null);
  
  // peer status
  const [peerConnected, setPeerConnected] = useState(''); // Track connected peer's name
  const [peerMicrobitConnected, setPeerMicrobitConnected] = useState(false); // Track connected peer's microbit connection status
  const [lastMessageSent, setLastMessageSent] = useState(''); // Stores last message sent/received

  

  

  return (
    <MessageContext.Provider value={{
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
      // sendMessage,
      connectedMicroBitDevice,
      setConnectedMicroBitDevice
    }}>
      {children}
    </MessageContext.Provider>
  );
}

// Custom hook to use the MessageContext
export function useMessageContext() {
  return useContext(MessageContext);
}
