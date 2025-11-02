import express from "express";
import { body } from "express-validator";
import { protect } from "../middleware/AuthMiddleware.js";
import { aiLimiter } from "../middleware/rateLimiter.js";
import {
  checkGrammarController,
  enhanceWritingController,
  summarizeTextController,
  completeTextController,
  getSuggestionsController,
} from "../controllers/ai.controllers.js";

const router = express.Router();

router.post(
  "/grammar-check",
  protect,
  aiLimiter,
  [body("text").trim().notEmpty().withMessage("Text is required")],
  checkGrammarController
);

router.post(
  "/enhance",
  protect,
  aiLimiter,
  [body("text").trim().notEmpty().withMessage("Text is required")],
  enhanceWritingController
);

router.post(
  "/summarize",
  protect,
  aiLimiter,
  [body("text").trim().notEmpty().withMessage("Text is required")],
  summarizeTextController
);

router.post(
  "/complete",
  protect,
  aiLimiter,
  [body("text").trim().notEmpty().withMessage("Text is required")],
  completeTextController
);

router.post(
  "/suggestions",
  protect,
  aiLimiter,
  [body("text").trim().notEmpty().withMessage("Text is required")],
  getSuggestionsController
);

export default router;
