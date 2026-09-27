import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  adminId: { type: String, required: true },
  action: { type: String, required: true, maxlength: 80 },
  resource: { type: String, required: true, maxlength: 80 },
  resourceId: { type: String, default: "", maxlength: 120 },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: { createdAt: true, updatedAt: false }, versionKey: false });

auditLogSchema.index({ createdAt: -1 });
export const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);
