import { body, validationResult } from "express-validator";

export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  };
};
// Validation rules
export const authValidation = {
  register: [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email address")
      .normalizeEmail(),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  login: [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email address")
      .normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
};

export const documentValidation = {
  create: [
    body("title")
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage("Title must be less than 200 characters"),
  ],
  update: [
    body("title")
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage("Title must be less than 200 characters"),
    body("content").optional(),
  ],
  share: [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email address"),
    body("role")
      .notEmpty()
      .withMessage("Role is required")
      .isIn(["viewer", "editor"])
      .withMessage("Role must be either viewer or editor"),
  ],
};

export const aiValidation = {
  process: [
    body("text")
      .trim()
      .notEmpty()
      .withMessage("Text is required")
      .isLength({ min: 10, max: 5000 })
      .withMessage("Text must be between 10 and 5000 characters"),
  ],
};

export default {
  validate,
  authValidation,
  documentValidation,
  aiValidation,
};
