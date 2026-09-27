import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  playlistId: { type: mongoose.Schema.Types.ObjectId, ref: "Playlist", default: null },
  source: { type: String, enum: ["playlist", "manual"], default: "playlist" },
  status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
  externalVideoId: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true, maxlength: 300 },
  description: { type: String, default: "", maxlength: 5000 },
  thumbnail: { type: String, default: "" },
  duration: { type: String, default: "" },
  position: { type: Number, required: true, min: 0 },
  isFeatured: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 0, min: 0, max: 100000 },
  publishedAt: { type: Date, default: null },
}, { timestamps: true, versionKey: false });

videoSchema.index({ playlistId: 1, externalVideoId: 1 }, { unique: true });
videoSchema.index({ playlistId: 1, position: 1 });
videoSchema.index({ isFeatured: 1, displayOrder: 1, publishedAt: -1 });
videoSchema.index({ status: 1, updatedAt: -1 });
videoSchema.index({ title: "text" });

export const Video = mongoose.models.Video || mongoose.model("Video", videoSchema);
