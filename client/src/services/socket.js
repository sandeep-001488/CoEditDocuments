import { io } from "socket.io-client";

let socket = null;
let connectionPromise = null;

export const initSocket = (documentId, token) => {
  // If already connected to same document, return existing socket
  if (socket && socket.connected && socket.documentId === documentId) {
    console.log("♻️ Reusing existing socket connection");
    return socket;
  }

  // Disconnect existing socket if connecting to different document
  if (socket && socket.connected) {
    console.log("🔄 Disconnecting from previous document");
    socket.disconnect();
  }

  const SOCKET_URL =
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

  console.log("🔌 Creating new socket connection to:", SOCKET_URL);

  socket = io(SOCKET_URL, {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    forceNew: true, // Force new connection
  });

  socket.documentId = documentId;

  // Wait for connection before emitting join
  connectionPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Connection timeout"));
    }, 10000);

    socket.on("connect", () => {
      clearTimeout(timeout);
      console.log("✅ Socket connected:", socket.id);

      // Wait a bit before joining to ensure server is ready
      setTimeout(() => {
        console.log("📤 Emitting join-document for:", documentId);
        socket.emit("join-document", { documentId, token });
      }, 100);

      resolve(socket);
    });

    socket.on("connect_error", (error) => {
      clearTimeout(timeout);
      console.error("❌ Connection error:", error);
      reject(error);
    });
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
    // Only auto-reconnect for network issues, not intentional disconnects
    if (reason === "io server disconnect") {
      socket.connect();
    }
  });

  socket.on("error", (error) => {
    console.error("❌ Socket error:", error);
  });

  socket.on("reconnect", (attemptNumber) => {
    console.log("🔄 Reconnected after", attemptNumber, "attempts");
    // Re-join document after reconnection
    setTimeout(() => {
      socket.emit("join-document", { documentId, token });
    }, 100);
  });

  socket.on("reconnect_attempt", (attemptNumber) => {
    console.log("🔄 Reconnection attempt", attemptNumber);
  });

  socket.on("reconnect_error", (error) => {
    console.error("❌ Reconnection error:", error);
  });

  socket.on("reconnect_failed", () => {
    console.error("❌ Reconnection failed");
  });

  return socket;
};

export const disconnectSocket = (documentId) => {
  if (socket && socket.documentId === documentId) {
    console.log("👋 Disconnecting socket for document:", documentId);
    socket.emit("leave-document", documentId);
    socket.disconnect();
    socket = null;
    connectionPromise = null;
  }
};

export const getSocket = () => socket;

export const waitForConnection = () => connectionPromise;

export default { initSocket, disconnectSocket, getSocket, waitForConnection };