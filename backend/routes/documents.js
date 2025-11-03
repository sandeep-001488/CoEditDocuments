import express from "express";
import { body } from "express-validator";
import { protect } from "../middleware/AuthMiddleware.js";
import {
  createDocumentController,
  getDocumentsController,
  getDocumentController,
  updateDocumentController,
  deleteDocumentController,
  shareDocumentController,
  generateShareLinkController,
  sendEmailInvitationController,
} from "../controllers/document.controllers.js";

const router = express.Router();

router.post("/", protect, [body("title").optional()], createDocumentController);
router.get("/", protect, getDocumentsController);
router.get("/:id", protect, getDocumentController);
router.put("/:id", protect, updateDocumentController);
router.delete("/:id", protect, deleteDocumentController);

router.post(
  "/:id/share",
  protect,
  [body("email").isEmail(), body("role").isIn(["viewer", "editor"])],
  shareDocumentController
);

router.post(
  "/:id/share-link",
  protect,
  [body("permission").optional().isIn(["viewer", "editor"])],
  generateShareLinkController
);

router.post(
  "/:id/send-invitation",
  protect,
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("permission")
      .isIn(["viewer", "editor"])
      .withMessage("Permission must be viewer or editor"),
  ],
  sendEmailInvitationController
);

export default router;