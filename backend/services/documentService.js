import Document from "../models/Document.js";
import User from "../models/User.js";
import crypto from "crypto";

export const createDocument = async (userId, title = "Untitled Document") => {
  const doc = await Document.create({ title, owner: userId, content: "" });
  await doc.populate("owner", "name email avatar");
  return doc;
};

export const getDocuments = async (userId) => {
  // Only return documents owned by the user (not shared documents)
  return await Document.find({ owner: userId })
    .populate("owner", "name email avatar")
    .populate("collaborators.user", "name email avatar")
    .sort({ updatedAt: -1 });
};

export const getDocument = async (documentId, userId) => {
  const doc = await Document.findById(documentId)
    .populate("owner", "name email avatar")
    .populate("collaborators.user", "name email avatar");

  if (!doc) throw new Error("Document not found");

  const hasAccess =
    doc.owner._id.toString() === userId ||
    doc.collaborators.some((c) => c.user._id.toString() === userId) ||
    doc.isPublic;

  if (!hasAccess) throw new Error("Not authorized");
  return doc;
};

export const updateDocument = async (documentId, userId, updates) => {
  const doc = await Document.findById(documentId);
  if (!doc) throw new Error("Document not found");

  const isOwner = doc.owner.toString() === userId;
  const isEditor = doc.collaborators.some(
    (c) => c.user.toString() === userId && c.role === "editor"
  );
  if (!isOwner && !isEditor) throw new Error("Not authorized");

  if (updates.title !== undefined) doc.title = updates.title;
  if (updates.content !== undefined) doc.content = updates.content;

  await doc.save();
  await doc.populate("owner", "name email avatar");
  return doc;
};

export const deleteDocument = async (documentId, userId) => {
  const doc = await Document.findById(documentId);
  if (!doc) throw new Error("Document not found");
  if (doc.owner.toString() !== userId) throw new Error("Not authorized");
  await doc.deleteOne();
  return { message: "Document deleted successfully" };
};

export const shareDocument = async (
  documentId,
  userId,
  email,
  role = "viewer"
) => {
  const doc = await Document.findById(documentId);
  if (!doc) throw new Error("Document not found");
  if (doc.owner.toString() !== userId) throw new Error("Not authorized");

  const collaborator = await User.findOne({ email });
  if (!collaborator) throw new Error("User not found");

  // Don't add owner as collaborator
  if (collaborator._id.toString() === userId) {
    throw new Error("Cannot share document with yourself");
  }

  const existing = doc.collaborators.find(
    (c) => c.user.toString() === collaborator._id.toString()
  );
  if (existing) {
    existing.role = role;
  } else {
    doc.collaborators.push({ user: collaborator._id, role });
  }

  await doc.save();
  await doc.populate("owner", "name email avatar");
  await doc.populate("collaborators.user", "name email avatar");
  return doc;
};

export const generateShareLink = async (
  documentId,
  userId,
  permission = "viewer"
) => {
  const doc = await Document.findById(documentId);
  if (!doc) throw new Error("Document not found");
  if (doc.owner.toString() !== userId) throw new Error("Not authorized");

  const token = crypto.randomBytes(32).toString("hex");
  doc.shareToken = token;
  doc.sharePermission = permission;
  doc.isPublic = true;
  await doc.save();

  return {
    shareLink: `${process.env.CLIENT_URL}/editor/${documentId}?token=${token}&permission=${permission}`,
    permission: permission,
  };
};