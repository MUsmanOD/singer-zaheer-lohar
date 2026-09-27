import mongoose from "mongoose";

const siteVisitSchema = new mongoose.Schema({
  ipHash: { type: String, required: true, maxlength: 96 },
  path: { type: String, required: true, maxlength: 240 },
  referrer: { type: String, default: "", maxlength: 500 },
  userAgent: { type: String, default: "", maxlength: 500 },
}, { timestamps: { createdAt: true, updatedAt: false }, versionKey: false });

siteVisitSchema.index({ createdAt: -1 });
siteVisitSchema.index({ ipHash: 1, createdAt: -1 });

export const SiteVisit = mongoose.models.SiteVisit || mongoose.model("SiteVisit", siteVisitSchema);
