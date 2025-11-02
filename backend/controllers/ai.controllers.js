import { validationResult } from "express-validator";
import {
  checkGrammar,
  enhanceWriting,
  summarizeText,
  completeText,
  getSuggestions,
} from "../services/aiService.js";

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return false;
  }
  return true;
};

export const checkGrammarController = async (req, res) => {
  if (!handleValidation(req, res)) return;
  const result = await checkGrammar(req.body.text);
  res.status(200).json({ success: true, result });
};

export const enhanceWritingController = async (req, res) => {
  if (!handleValidation(req, res)) return;
  const result = await enhanceWriting(req.body.text);
  res.status(200).json({ success: true, result });
};

export const summarizeTextController = async (req, res) => {
  if (!handleValidation(req, res)) return;
  const result = await summarizeText(req.body.text);
  res.status(200).json({ success: true, result });
};

export const completeTextController = async (req, res) => {
  if (!handleValidation(req, res)) return;
  const result = await completeText(req.body.text);
  res.status(200).json({ success: true, result });
};

export const getSuggestionsController = async (req, res) => {
  if (!handleValidation(req, res)) return;
  const result = await getSuggestions(req.body.text);
  res.status(200).json({ success: true, result });
};
