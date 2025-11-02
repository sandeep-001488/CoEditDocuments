import { validationResult } from "express-validator";
import {
  createDocument,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
  shareDocument,
  generateShareLink,
} from "../services/documentService.js";

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return false;
  }
  return true;
};

export const createDocumentController = async (req, res) => {
  if (!handleValidation(req, res)) return;
  const doc = await createDocument(req.user.id, req.body.title);
  res.status(201).json({ success: true, document: doc });
};

export const getDocumentsController = async (req, res) => {
  const docs = await getDocuments(req.user.id);
  res.status(200).json({ success: true, count: docs.length, documents: docs });
};

export const getDocumentController = async (req, res) => {
  const doc = await getDocument(req.params.id, req.user.id);
  res.status(200).json({ success: true, document: doc });
};

export const updateDocumentController = async (req, res) => {
  const doc = await updateDocument(req.params.id, req.user.id, req.body);
  res.status(200).json({ success: true, document: doc });
};

export const deleteDocumentController = async (req, res) => {
  const result = await deleteDocument(req.params.id, req.user.id);
  res.status(200).json({ success: true, message: result.message });
};

export const shareDocumentController = async (req, res) => {
  if (!handleValidation(req, res)) return;
  const doc = await shareDocument(
    req.params.id,
    req.user.id,
    req.body.email,
    req.body.role
  );
  res.status(200).json({ success: true, document: doc });
};

export const generateShareLinkController = async (req, res) => {
  const link = await generateShareLink(req.params.id, req.user.id);
  res.status(200).json({ success: true, shareLink: link.shareLink });
};
