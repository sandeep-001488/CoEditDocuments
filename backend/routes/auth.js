
import express from "express";
import { body } from "express-validator";
import { protect } from "../middleware/AuthMiddleware.js";
import {
  registerController,
  loginController,
  getMeController,
  logoutController,
} from "../controllers/auth.controllers.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
  ],
  registerController
);

router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  loginController
);

router.get("/me", protect, getMeController);

router.post("/logout", protect, logoutController);

export default router;
