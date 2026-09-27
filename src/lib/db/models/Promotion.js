import mongoose from "mongoose";

export const PROMOTION_STATUSES = ["new", "reviewing", "contacted", "closed"];

const promotionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  organization: { type: String, default: "", trim: true, maxlength: 140 },
  phone: { type: String, default: "", trim: true, maxlength: 32 },
  platform: { type: String, required: true, enum: ["youtube", "instagram", "tiktok", "spotify", "facebook", "x", "other"] },
  campaignType: { type: String, required: true, enum: ["music-release", "brand-partnership", "event", "content", "other"] },
  campaignWindow: { type: String, default: "", trim: true, maxlength: 120 },
  budget: { type: String, default: "", trim: true, maxlength: 60 },
  profileUrl: { type: String, default: "", trim: true, maxlength: 300 },
  message: { type: String, required: true, trim: true, maxlength: 3000 },
  status: { type: String, required: true, enum: PROMOTION_STATUSES, default: "new", index: true },
  adminNotes: { type: String, default: "", maxlength: 5000 },
}, { timestamps: true, versionKey: false });

promotionSchema.index({ createdAt: -1 });

export const Promotion = mongoose.models.Promotion || mongoose.model("Promotion", promotionSchema);
