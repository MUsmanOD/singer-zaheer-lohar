import nextEnv from "@next/env";
import mongoose from "mongoose";
import { hashPassword } from "../src/lib/auth/password.mjs";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error("Seed failed: MONGODB_URI is required.");
  process.exit(1);
}
if (!email || !email.includes("@") || email.length > 254) {
  console.error("Seed failed: set a valid ADMIN_EMAIL in .env.");
  process.exit(1);
}
if (!password || password.length < 12) {
  console.error("Seed failed: ADMIN_PASSWORD must be at least 12 characters.");
  process.exit(1);
}
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  console.error("Seed failed: SESSION_SECRET must be at least 32 characters.");
  process.exit(1);
}

const adminUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: "admin" },
  isActive: { type: Boolean, default: true },
  lastLoginAt: { type: Date, default: null },
}, { timestamps: true, versionKey: false });
const AdminUser = mongoose.models.AdminUser || mongoose.model("AdminUser", adminUserSchema);

try {
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000, bufferCommands: false });
  const passwordHash = hashPassword(password);
  const result = await AdminUser.updateOne(
    { email },
    { $set: { passwordHash, role: "admin", isActive: true }, $setOnInsert: { email } },
    { upsert: true, runValidators: true },
  );
  const action = result.upsertedCount ? "created" : "updated";
  console.log(`Admin user ${action}: ${email}`);
} catch (error) {
  console.error(`Seed failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
