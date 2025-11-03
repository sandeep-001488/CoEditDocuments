// import { validationResult } from "express-validator";
// import * as documentService from "../services/documentService.js";
// import { sendShareInvitation } from "../services/emailService.js";
// import User from "../models/User.js";

// export const createDocumentController = async (req, res, next) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         errors: errors.array(),
//       });
//     }

//     const { title } = req.body;
//     const document = await documentService.createDocument(req.user.id, title);

//     res.status(201).json({
//       success: true,
//       message: "Document created successfully",
//       document,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export const getDocumentsController = async (req, res, next) => {
//   try {
//     const documents = await documentService.getDocuments(req.user.id);

//     res.status(200).json({
//       success: true,
//       count: documents.length,
//       documents,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export const getDocumentController = async (req, res, next) => {
//   try {
//     const document = await documentService.getDocument(
//       req.params.id,
//       req.user.id
//     );

//     res.status(200).json({
//       success: true,
//       document,
//     });
//   } catch (error) {
//     if (
//       error.message === "Document not found" ||
//       error.message === "Not authorized"
//     ) {
//       return res.status(404).json({
//         success: false,
//         message: error.message,
//       });
//     }
//     next(error);
//   }
// };

// export const updateDocumentController = async (req, res, next) => {
//   try {
//     const { title, content } = req.body;
//     const document = await documentService.updateDocument(
//       req.params.id,
//       req.user.id,
//       { title, content }
//     );

//     res.status(200).json({
//       success: true,
//       message: "Document updated successfully",
//       document,
//     });
//   } catch (error) {
//     if (
//       error.message === "Document not found" ||
//       error.message === "Not authorized"
//     ) {
//       return res.status(403).json({
//         success: false,
//         message: error.message,
//       });
//     }
//     next(error);
//   }
// };

// export const deleteDocumentController = async (req, res, next) => {
//   try {
//     const result = await documentService.deleteDocument(
//       req.params.id,
//       req.user.id
//     );

//     res.status(200).json({
//       success: true,
//       message: result.message,
//     });
//   } catch (error) {
//     if (
//       error.message === "Document not found" ||
//       error.message === "Not authorized"
//     ) {
//       return res.status(403).json({
//         success: false,
//         message: error.message,
//       });
//     }
//     next(error);
//   }
// };

// export const shareDocumentController = async (req, res, next) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         errors: errors.array(),
//       });
//     }

//     const { email, role } = req.body;
//     const document = await documentService.shareDocument(
//       req.params.id,
//       req.user.id,
//       email,
//       role
//     );

//     res.status(200).json({
//       success: true,
//       message: "Document shared successfully",
//       document,
//     });
//   } catch (error) {
//     if (
//       error.message === "Document not found" ||
//       error.message === "Not authorized" ||
//       error.message === "User not found"
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: error.message,
//       });
//     }
//     next(error);
//   }
// };

// export const generateShareLinkController = async (req, res, next) => {
//   try {
//     const { permission } = req.body; // "editor" or "viewer"
//     const result = await documentService.generateShareLink(
//       req.params.id,
//       req.user.id,
//       permission || "viewer"
//     );

//     res.status(200).json({
//       success: true,
//       message: "Share link generated successfully",
//       shareLink: result.shareLink,
//       permission: result.permission,
//     });
//   } catch (error) {
//     if (
//       error.message === "Document not found" ||
//       error.message === "Not authorized"
//     ) {
//       return res.status(403).json({
//         success: false,
//         message: error.message,
//       });
//     }
//     next(error);
//   }
// };

// export const sendEmailInvitationController = async (req, res, next) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         errors: errors.array(),
//       });
//     }

//     const { email, permission } = req.body; // permission: "editor" or "viewer"

//     // Check if recipient exists
//     const recipient = await User.findOne({ email });
//     if (!recipient) {
//       return res.status(404).json({
//         success: false,
//         message: "User with this email does not exist",
//       });
//     }

//     // Get document and owner info
//     const document = await documentService.getDocument(
//       req.params.id,
//       req.user.id
//     );

//     const owner = await User.findById(req.user.id);

//     // Generate share link
//     const { shareLink } = await documentService.generateShareLink(
//       req.params.id,
//       req.user.id,
//       permission
//     );

//     // Send email
//     await sendShareInvitation(
//       owner.email,
//       owner.name,
//       email,
//       document.title,
//       shareLink,
//       permission
//     );

//     // Also add to collaborators
//     await documentService.shareDocument(
//       req.params.id,
//       req.user.id,
//       email,
//       permission
//     );

//     res.status(200).json({
//       success: true,
//       message: `Invitation sent to ${email}`,
//     });
//   } catch (error) {
//     if (error.message === "Failed to send invitation email") {
//       return res.status(500).json({
//         success: false,
//         message: "Failed to send email. Please check email configuration.",
//       });
//     }
//     next(error);
//   }
// };

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

    const owner = await User.findById(req.user.id);

    // Generate share link
    const { shareLink } = await documentService.generateShareLink(
      req.params.id,
      req.user.id,
      permission
    );

    logger.info(`Generated share link: ${shareLink}`);

    // Try to send email
    try {
      const emailResult = await sendShareInvitation(
        owner.email,
        owner.name,
        email,
        document.title,
        shareLink,
        permission
      );

      logger.success(`Email sent successfully to ${email}`);

      // Also add to collaborators if email sent successfully
      await documentService.shareDocument(
        req.params.id,
        req.user.id,
        email,
        permission
      );

      res.status(200).json({
        success: true,
        message: `Invitation sent successfully to ${email}`,
        emailSent: true,
        shareLink: shareLink, // Send link back as fallback
      });
    } catch (emailError) {
      // Email failed, but still add to collaborators and return link
      logger.error(
        "Email sending failed, but proceeding with sharing:",
        emailError
      );

      await documentService.shareDocument(
        req.params.id,
        req.user.id,
        email,
        permission
      );

      // Return success but indicate email failed
      res.status(200).json({
        success: true,
        message: `Document shared with ${email}, but email notification failed. Please share this link manually.`,
        emailSent: false,
        shareLink: shareLink,
        error:
          "Email service temporarily unavailable. Please check your email configuration.",
      });
    }
  } catch (error) {
    logger.error("Send invitation error:", error);

    if (error.message === "Email service not configured properly") {
      return res.status(503).json({
        success: false,
        message:
          "Email service is not configured. Please contact administrator.",
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