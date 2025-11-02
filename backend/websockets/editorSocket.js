import { verifyToken } from "../utils/jwt.js";
import Document from "../models/Document.js";
import User from "../models/User.js";
import logger from "../utils/logger.js";

// Store active users per document
const activeUsers = new Map();
// Store cursor positions
const cursorPositions = new Map();

export const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    logger.info(`User connected: ${socket.id}`);

    // Join document room
    socket.on("join-document", async ({ documentId, token }) => {
      try {
        // Verify token
        const decoded = verifyToken(token);
        if (!decoded) {
          socket.emit("error", { message: "Invalid token" });
          return;
        }

        // Verify document access
        const document = await Document.findById(documentId)
          .populate("owner", "name email avatar")
          .populate("collaborators.user", "name email avatar");

        if (!document) {
          socket.emit("error", { message: "Document not found" });
          return;
        }

        // Check if user has access
        const hasAccess =
          document.owner._id.toString() === decoded.id ||
          document.collaborators.some(
            (c) => c.user._id.toString() === decoded.id
          ) ||
          document.isPublic;

        if (!hasAccess) {
          socket.emit("error", { message: "Access denied" });
          return;
        }

        // Join room
        socket.join(documentId);
        socket.documentId = documentId;
        socket.userId = decoded.id;

        // Get user info
        const user = await User.findById(decoded.id);

        // Track active user
        if (!activeUsers.has(documentId)) {
          activeUsers.set(documentId, new Map());
        }
        activeUsers.get(documentId).set(socket.id, {
          id: user._id,
          name: user.name,
          avatar: user.avatar,
          socketId: socket.id,
          color: getRandomColor(user._id.toString()),
        });

        // Send current document state
        socket.emit("document-loaded", {
          content: document.content,
          title: document.title,
          updatedAt: document.updatedAt,
        });

        // Notify others
        const users = Array.from(activeUsers.get(documentId).values());
        io.to(documentId).emit("users-update", users);

        // Send existing cursor positions
        if (cursorPositions.has(documentId)) {
          const cursors = Array.from(cursorPositions.get(documentId).values());
          socket.emit("cursors-update", cursors);
        }

        logger.success(`User ${user.name} joined document ${documentId}`);
      } catch (error) {
        logger.error("Join document error:", error);
        socket.emit("error", { message: "Failed to join document" });
      }
    });

    // Handle text changes
    socket.on("text-change", ({ documentId, delta, content }) => {
      socket.to(documentId).emit("text-change", {
        delta,
        content,
        userId: socket.userId,
        socketId: socket.id,
      });
    });

    // Handle cursor movement
    socket.on("cursor-move", ({ documentId, range, index }) => {
      if (!cursorPositions.has(documentId)) {
        cursorPositions.set(documentId, new Map());
      }

      const user = activeUsers.get(documentId)?.get(socket.id);
      if (user) {
        const cursorData = {
          socketId: socket.id,
          userId: socket.userId,
          name: user.name,
          color: user.color,
          range,
          index,
        };

        cursorPositions.get(documentId).set(socket.id, cursorData);
        socket.to(documentId).emit("cursor-update", cursorData);
      }
    });

    // Save document
    socket.on("save-document", async ({ documentId, content, title }) => {
      try {
        const document = await Document.findById(documentId);
        if (document) {
          let updated = false;

          if (content !== undefined && document.content !== content) {
            document.content = content;
            updated = true;
          }

          if (title !== undefined && document.title !== title) {
            document.title = title;
            updated = true;
          }

          if (updated) {
            await document.save();
            logger.success(`Document ${documentId} saved`);
          }

          socket.emit("document-saved", {
            success: true,
            updatedAt: document.updatedAt,
          });

          // Notify other users
          socket.to(documentId).emit("document-updated", {
            updatedAt: document.updatedAt,
          });
        }
      } catch (error) {
        logger.error("Save document error:", error);
        socket.emit("document-saved", {
          success: false,
          error: error.message,
        });
      }
    });

    // Leave document
    socket.on("leave-document", (documentId) => {
      handleUserLeave(socket, documentId, io);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      logger.info(`User disconnected: ${socket.id}`);
      if (socket.documentId) {
        handleUserLeave(socket, socket.documentId, io);
      }
    });

    // Handle typing indicator
    socket.on("typing", ({ documentId, isTyping }) => {
      const user = activeUsers.get(documentId)?.get(socket.id);
      if (user) {
        socket.to(documentId).emit("user-typing", {
          userId: socket.userId,
          name: user.name,
          isTyping,
        });
      }
    });
  });
};

// Helper function to handle user leaving
const handleUserLeave = (socket, documentId, io) => {
  if (activeUsers.has(documentId)) {
    activeUsers.get(documentId).delete(socket.id);
    const users = Array.from(activeUsers.get(documentId).values());
    io.to(documentId).emit("users-update", users);

    // Clean up if no users left
    if (users.length === 0) {
      activeUsers.delete(documentId);
      cursorPositions.delete(documentId);
    }
  }

  if (cursorPositions.has(documentId)) {
    cursorPositions.get(documentId).delete(socket.id);
    io.to(documentId).emit("cursor-removed", { socketId: socket.id });
  }

  socket.leave(documentId);
};

// Helper function to generate random color for cursor
const getRandomColor = (userId) => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E2",
  ];

  const index = userId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

export default initializeSocket;
