import mongoose from "mongoose";

const adminNotificationSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ["booking.created", "promotion.created"], maxlength: 80 },
  title: { type: String, required: true, maxlength: 160 },
  message: { type: String, required: true, maxlength: 300 },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
  promotionId: { type: mongoose.Schema.Types.ObjectId, ref: "Promotion", default: null },
  isRead: { type: Boolean, default: false, index: true },
  readAt: { type: Date, default: null },
}, { timestamps: { createdAt: true, updatedAt: false }, versionKey: false });

adminNotificationSchema.index({ isRead: 1, createdAt: -1 });

export const AdminNotification = mongoose.models.AdminNotification || mongoose.model("AdminNotification", adminNotificationSchema);
