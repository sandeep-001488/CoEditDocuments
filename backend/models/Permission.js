import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema({
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Document",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  role: {
    type: String,
    enum: ["owner", "editor", "viewer"],
    default: "viewer",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to prevent duplicate permissions
permissionSchema.index({ document: 1, user: 1 }, { unique: true });

const Permission = mongoose.model("Permission", permissionSchema);
export default Permission;
