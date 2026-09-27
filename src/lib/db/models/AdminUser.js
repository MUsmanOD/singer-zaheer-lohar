import mongoose from "mongoose";

const adminUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ["admin"], default: "admin" },
  isActive: { type: Boolean, default: true, index: true },
  lastLoginAt: { type: Date, default: null },
}, { timestamps: true, versionKey: false });

export const AdminUser = mongoose.models.AdminUser || mongoose.model("AdminUser", adminUserSchema);
