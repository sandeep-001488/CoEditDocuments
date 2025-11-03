import { verifyToken } from "../utils/jwt.js";
import Document from "../models/Document.js";
import User from "../models/User.js";
import logger from "../utils/logger.js";

const activeUsers = new Map();
const activeOwners = new Map();
const joinNotificationsSent = new Map();

export const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    logger.info(`User connected: ${socket.id}`);

    socket.on("join-document", async ({ documentId, token }) => {
      try {
        const decoded = verifyToken(token);
        if (!decoded) {
          socket.emit("error", { message: "Invalid token" });
          return;
        }

        const document = await Document.findById(documentId)
          .populate("owner", "name email avatar")
          .populate("collaborators.user", "name email avatar");

        if (!document) {
          socket.emit("error", { message: "Document not found" });
          return;
        }

        const user = await User.findById(decoded.id);
        const userId = user._id.toString();
        const ownerId = document.owner._id.toString();
        const isOwner = userId === ownerId;

        // Find collaborator role
        const collaborator = document.collaborators.find(
          (c) => c.user._id.toString() === userId
        );

        // Determine user role - FIXED: use collaborator.role directly
        let userRole;
        if (isOwner) {
          userRole = "owner";
        } else if (collaborator) {
          userRole = collaborator.role; // This will be "editor" or "viewer"
        } else if (document.isPublic) {
          // If document is public (shared via link), check sharePermission
          userRole = document.sharePermission || "viewer";
        } else {
          userRole = null;
        }

        const hasAccess = isOwner || collaborator || document.isPublic;

        if (!hasAccess) {
          socket.emit("error", { message: "Access denied" });
          return;
        }

        if (isOwner) {
          activeOwners.set(documentId, {
            socketId: socket.id,
            userId: userId,
            name: user.name,
            joinedAt: Date.now(),
          });
          logger.success(
            `✅ Owner ${user.name} marked online for document ${documentId}`
          );
        }

        if (!isOwner) {
          const ownerOnline = activeOwners.get(documentId);
          if (!ownerOnline) {
            logger.warn(
              `❌ Non-owner ${user.name} tried to join but owner not online`
            );
            socket.emit("error", {
              message: "Document owner is not online. Please try again later.",
            });
            return;
          }
        }

        socket.join(documentId);
        socket.documentId = documentId;
        socket.userId = userId;
        socket.isOwner = isOwner;
        socket.userName = user.name;

        if (!activeUsers.has(documentId)) {
          activeUsers.set(documentId, new Map());
        }
        if (!joinNotificationsSent.has(documentId)) {
          joinNotificationsSent.set(documentId, new Set());
        }

        const existingEntry = Array.from(
          activeUsers.get(documentId).entries()
        ).find(([sid, userData]) => userData.userId === userId);

        if (existingEntry) {
          const [oldSocketId] = existingEntry;
          activeUsers.get(documentId).delete(oldSocketId);
          logger.info(
            `Removed old socket ${oldSocketId} for user ${user.name}`
          );
        }

        const userData = {
          id: user._id,
          userId: userId,
          name: user.name,
          avatar: user.avatar,
          socketId: socket.id,
          color: getRandomColor(userId),
          isOwner: isOwner,
          role: userRole, // This will now be correct: "owner", "editor", or "viewer"
          joinedAt: Date.now(),
        };

        activeUsers.get(documentId).set(socket.id, userData);

        socket.emit("document-loaded", {
          content: document.content,
          title: document.title,
          updatedAt: document.updatedAt,
          isOwner: isOwner,
          ownerId: ownerId,
          userRole: userRole, // Send correct role to client
        });

        const users = getUniqueUsers(documentId);
        io.to(documentId).emit("users-update", users);

        const notificationKey = `${documentId}-${userId}`;
        if (!joinNotificationsSent.get(documentId).has(notificationKey)) {
          if (!isOwner) {
            const roleText = userRole === "editor" ? "Editor" : "Viewer";
            socket.to(documentId).emit("user-joined", {
              name: user.name,
              role: roleText,
              userId: userId,
            });
          }
          joinNotificationsSent.get(documentId).add(notificationKey);
        }

        logger.success(
          `✅ User ${user.name} (${userRole}) successfully joined document ${documentId}`
        );
      } catch (error) {
        logger.error("Join document error:", error);
        socket.emit("error", { message: "Failed to join document" });
      }
    });

    socket.on("text-change", ({ documentId, delta, content }) => {
      socket.to(documentId).emit("text-change", {
        delta,
        content,
        userId: socket.userId,
        socketId: socket.id,
      });
    });

    socket.on("cursor-move", ({ documentId, range, index }) => {
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

        socket.to(documentId).emit("cursor-update", cursorData);
      }
    });

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

    socket.on("leave-document", (documentId) => {
      logger.info(
        `User ${socket.userName} manually leaving document ${documentId}`
      );
      handleUserLeave(socket, documentId, io, false);
    });

    socket.on("disconnect", (reason) => {
      logger.info(
        `User ${socket.userName} disconnected: ${socket.id}, Reason: ${reason}`
      );

      if (socket.documentId) {
        const wasOwner = socket.isOwner;
        const documentId = socket.documentId;

        handleUserLeave(socket, documentId, io, true);

        if (wasOwner) {
          logger.warn(
            `⚠️ Owner disconnected from document ${documentId}, kicking all users`
          );

          setTimeout(() => {
            io.to(documentId).emit("owner-disconnected", {
              message:
                "The document owner has disconnected. You will be redirected to dashboard.",
            });

            const socketsInRoom = io.sockets.adapter.rooms.get(documentId);
            if (socketsInRoom) {
              socketsInRoom.forEach((socketId) => {
                const clientSocket = io.sockets.sockets.get(socketId);
                if (clientSocket && socketId !== socket.id) {
                  clientSocket.leave(documentId);
                }
              });
            }

            activeUsers.delete(documentId);
            activeOwners.delete(documentId);
            joinNotificationsSent.delete(documentId);
          }, 100);
        }
      }
    });

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

    socket.on("image-uploaded", ({ documentId, imageData }) => {
      socket.to(documentId).emit("new-image", imageData);
    });

    socket.on("heartbeat", () => {
      socket.emit("heartbeat-ack");
      if (
        socket.isOwner &&
        socket.documentId &&
        activeOwners.has(socket.documentId)
      ) {
        const ownerData = activeOwners.get(socket.documentId);
        ownerData.lastSeen = Date.now();
      }
    });
  });
};

const handleUserLeave = (socket, documentId, io, isDisconnect) => {
  if (!activeUsers.has(documentId)) return;

  const user = activeUsers.get(documentId).get(socket.id);
  activeUsers.get(documentId).delete(socket.id);

  if (socket.isOwner && activeOwners.has(documentId)) {
    logger.info(
      `🔴 Removing owner from activeOwners for document ${documentId}`
    );
    activeOwners.delete(documentId);
  }

  if (user && isDisconnect && !socket.isOwner) {
    const roleText =
      user.role === "owner"
        ? "Owner"
        : user.role === "editor"
        ? "Editor"
        : "Viewer";
    socket.to(documentId).emit("user-left", {
      name: user.name,
      role: roleText,
      userId: user.userId,
    });

    if (joinNotificationsSent.has(documentId)) {
      joinNotificationsSent
        .get(documentId)
        .delete(`${documentId}-${user.userId}`);
    }
  }

  const users = getUniqueUsers(documentId);
  io.to(documentId).emit("users-update", users);

  if (users.length === 0) {
    activeUsers.delete(documentId);
    activeOwners.delete(documentId);
    joinNotificationsSent.delete(documentId);
    logger.info(`🧹 Cleaned up all data for document ${documentId}`);
  }

  socket.leave(documentId);
};

const getUniqueUsers = (documentId) => {
  if (!activeUsers.has(documentId)) return [];

  const userMap = new Map();
  const users = Array.from(activeUsers.get(documentId).values());

  users.forEach((user) => {
    if (!userMap.has(user.userId)) {
      userMap.set(user.userId, user);
    }
  });

  return Array.from(userMap.values());
};

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