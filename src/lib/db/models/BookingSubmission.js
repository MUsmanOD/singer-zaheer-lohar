import mongoose from "mongoose";

const bookingSubmissionSchema = new mongoose.Schema({
  fingerprint: { type: String, required: true, unique: true, select: false },
  expiresAt: { type: Date, required: true },
}, { timestamps: { createdAt: true, updatedAt: false }, versionKey: false });

bookingSubmissionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const BookingSubmission = mongoose.models.BookingSubmission || mongoose.model("BookingSubmission", bookingSubmissionSchema);
