import { validationResult } from "express-validator";
import * as documentService from "../services/documentService.js";
import { sendShareInvitation } from "../services/emailService.js";
import User from "../models/User.js";

export const createDocumentController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { title } = req.body;
    const document = await documentService.createDocument(req.user.id, title);

    res.status(201).json({
      success: true,
      message: "Document created successfully",
      document,
    });
  } catch (error) {
    next(error);
  }
};

export const getDocumentsController = async (req, res, next) => {
  try {
    const documents = await documentService.getDocuments(req.user.id);

    res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    next(error);
  }
};

export const getDocumentController = async (req, res, next) => {
  try {
    const document = await documentService.getDocument(
      req.params.id,
      req.user.id
    );

    res.status(200).json({
      success: true,
      document,
    });
  } catch (error) {
    if (
      error.message === "Document not found" ||
      error.message === "Not authorized"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const updateDocumentController = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const document = await documentService.updateDocument(
      req.params.id,
      req.user.id,
      { title, content }
    );

    res.status(200).json({
      success: true,
      message: "Document updated successfully",
      document,
    });
  } catch (error) {
    if (
      error.message === "Document not found" ||
      error.message === "Not authorized"
    ) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const deleteDocumentController = async (req, res, next) => {
  try {
    const result = await documentService.deleteDocument(
      req.params.id,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    if (
      error.message === "Document not found" ||
      error.message === "Not authorized"
    ) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const shareDocumentController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, role } = req.body;
    const document = await documentService.shareDocument(
      req.params.id,
      req.user.id,
      email,
      role
    );

    res.status(200).json({
      success: true,
      message: "Document shared successfully",
      document,
    });
  } catch (error) {
    if (
      error.message === "Document not found" ||
      error.message === "Not authorized" ||
      error.message === "User not found"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const generateShareLinkController = async (req, res, next) => {
  try {
    const { permission } = req.body; // "editor" or "viewer"
    const result = await documentService.generateShareLink(
      req.params.id,
      req.user.id,
      permission || "viewer"
    );

    res.status(200).json({
      success: true,
      message: "Share link generated successfully",
      shareLink: result.shareLink,
      permission: result.permission,
    });
  } catch (error) {
    if (
      error.message === "Document not found" ||
      error.message === "Not authorized"
    ) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const sendEmailInvitationController = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, permission } = req.body; // permission: "editor" or "viewer"

    // Check if recipient exists
    const recipient = await User.findOne({ email });
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: "User with this email does not exist",
      });
    }

    // Get document and owner info
    const document = await documentService.getDocument(
      req.params.id,
      req.user.id
    );

    const owner = await User.findById(req.user.id);

    // Generate share link
    const { shareLink } = await documentService.generateShareLink(
      req.params.id,
      req.user.id,
      permission
    );

    // Send email
    await sendShareInvitation(
      owner.email,
      owner.name,
      email,
      document.title,
      shareLink,
      permission
    );

    // Also add to collaborators
    await documentService.shareDocument(
      req.params.id,
      req.user.id,
      email,
      permission
    );

    res.status(200).json({
      success: true,
      message: `Invitation sent to ${email}`,
    });
  } catch (error) {
    if (error.message === "Failed to send invitation email") {
      return res.status(500).json({
        success: false,
        message: "Failed to send email. Please check email configuration.",
      });
    }
    next(error);
  }
};