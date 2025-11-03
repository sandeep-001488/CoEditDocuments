import { validationResult } from "express-validator";
import * as documentService from "../services/documentService.js";
import { sendShareInvitation } from "../services/emailService.js";
import User from "../models/User.js";
import logger from "../utils/logger.js";

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
    const { permission } = req.body;
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

    const { email, permission } = req.body;
    const currentUser = await User.findById(req.user.id);

    // Check if trying to send to own email
    if (currentUser.email.toLowerCase() === email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "You cannot send an invitation to your own email address",
      });
    }

    logger.info(`Processing email invitation for ${email}...`);

    // Check if recipient exists
    const recipient = await User.findOne({ email });
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message:
          "User with this email does not exist. They need to register first.",
      });
    }

    // Get document and owner info
    const document = await documentService.getDocument(
      req.params.id,
      req.user.id
    );

    // Generate share link first
    const { shareLink } = await documentService.generateShareLink(
      req.params.id,
      req.user.id,
      permission
    );

    logger.info(`Generated share link: ${shareLink}`);

    // Add to collaborators immediately (before sending email)
    await documentService.shareDocument(
      req.params.id,
      req.user.id,
      email,
      permission
    );

    // Send immediate response to prevent timeout
    res.status(200).json({
      success: true,
      message: `Document shared with ${email}. Sending invitation email...`,
      emailSent: "pending",
      shareLink: shareLink,
    });

    // Send email asynchronously (don't await)
    sendShareInvitation(
      currentUser.email,
      currentUser.name,
      email,
      document.title,
      shareLink,
      permission
    )
      .then((emailResult) => {
        logger.success(`✅ Email sent successfully to ${email}`);
      })
      .catch((emailError) => {
        logger.error("Email sending failed:", emailError.message);
        // Email failed but user is already added as collaborator
      });
  } catch (error) {
    logger.error("Send invitation error:", error);

    if (error.message === "Email service not configured properly") {
      return res.status(503).json({
        success: false,
        message:
          "Email service is not configured. Please contact administrator.",
      });
    }

    if (error.message === "Cannot share document with yourself") {
      return res.status(400).json({
        success: false,
        message: "You cannot send an invitation to your own email address",
      });
    }

    if (
      error.message.includes("Document not found") ||
      error.message.includes("Not authorized")
    ) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to send invitation. Please try again later.",
    });
  }
};