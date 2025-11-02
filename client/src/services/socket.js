import { io } from "socket.io-client";

let socket = null;

export const initSocket = (documentId, token) => {
  if (socket && socket.connected) {
    return socket;
  }

  const SOCKET_URL =
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

  socket = io(SOCKET_URL, {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
    socket.emit("join-document", { documentId, token });
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected");
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });

  socket.on("connect_error", (error) => {
    console.error("Connection error:", error);
  });

  return socket;
};

export const disconnectSocket = (documentId) => {
  if (socket) {
    socket.emit("leave-document", documentId);
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

export default { initSocket, disconnectSocket, getSocket };
