import mongoose from "mongoose";

export const BOOKING_STATUSES = ["pending", "reviewing", "confirmed", "rejected", "cancelled", "completed"];

const bookingSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  phone: { type: String, required: true, trim: true, maxlength: 24 },
  eventType: { type: String, required: true, enum: ["concert", "wedding", "corporate", "private", "festival", "charity", "other"] },
  eventDate: { type: Date, required: true },
  startTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  endTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  venue: { type: String, required: true, trim: true, maxlength: 180 },
  city: { type: String, required: true, trim: true, maxlength: 100 },
  country: { type: String, required: true, trim: true, maxlength: 100 },
  expectedAudience: { type: Number, required: true, min: 1, max: 1000000 },
  message: { type: String, default: "", trim: true, maxlength: 3000 },
  status: { type: String, enum: BOOKING_STATUSES, default: "pending", index: true },
  adminNotes: { type: String, default: "", trim: true, maxlength: 5000 },
}, { timestamps: true, versionKey: false });

bookingSchema.index({ eventDate: 1, status: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ email: 1, eventDate: 1 });

export const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
