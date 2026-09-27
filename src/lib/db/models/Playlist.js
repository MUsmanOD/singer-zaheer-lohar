import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  externalTitle: { type: String, required: true, trim: true, maxlength: 120 },
  titleOverride: { type: String, default: null, trim: true, maxlength: 120 },
  slug: { type: String, required: true, trim: true, lowercase: true },
  description: { type: String, default: "", trim: true, maxlength: 1000 },
  externalDescription: { type: String, default: "", trim: true, maxlength: 1000 },
  descriptionOverride: { type: String, default: null, trim: true, maxlength: 1000 },
  playlistUrl: { type: String, required: true },
  platform: { type: String, enum: ["youtube"], default: "youtube" },
  externalPlaylistId: { type: String, required: true },
  thumbnail: { type: String, default: "" },
  videoCount: { type: Number, default: 0, min: 0 },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  isFeatured: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 0, min: 0 },
  lastSyncedAt: { type: Date, default: null },
  syncError: { type: String, default: "" },
  createdBy: { type: String, default: "" },
}, { timestamps: true, versionKey: false });

playlistSchema.index({ externalPlaylistId: 1 }, { unique: true });
playlistSchema.index({ slug: 1 }, { unique: true });
playlistSchema.index({ status: 1, isFeatured: 1, displayOrder: 1, createdAt: -1 });

export const Playlist = mongoose.models.Playlist || mongoose.model("Playlist", playlistSchema);
