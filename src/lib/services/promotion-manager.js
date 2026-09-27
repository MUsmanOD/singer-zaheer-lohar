import mongoose from "mongoose";
import { ApiError } from "@/lib/api/response";
import { AdminNotification } from "@/lib/db/models/AdminNotification";
import { AuditLog } from "@/lib/db/models/AuditLog";
import { Promotion, PROMOTION_STATUSES } from "@/lib/db/models/Promotion";

function safeId(id) {
  if (!mongoose.Types.ObjectId.isValid(id) || String(new mongoose.Types.ObjectId(id)) !== String(id)) {
    throw new ApiError("This promotion inquiry could not be found.", 404, "PROMOTION_NOT_FOUND");
  }
  return new mongoose.Types.ObjectId(id);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function serializePromotion(value, { detail = false } = {}) {
  const promotion = typeof value.toObject === "function" ? value.toObject() : value;
  const result = {
    id: String(promotion._id || promotion.id),
    name: promotion.name,
    email: promotion.email,
    organization: promotion.organization || "",
    phone: promotion.phone || "",
    platform: promotion.platform,
    campaignType: promotion.campaignType,
    campaignWindow: promotion.campaignWindow || "",
    budget: promotion.budget || "",
    profileUrl: promotion.profileUrl || "",
    message: promotion.message,
    status: promotion.status,
    createdAt: promotion.createdAt,
    updatedAt: promotion.updatedAt,
  };
  if (detail) result.adminNotes = promotion.adminNotes || "";
  return result;
}

export async function createPromotion(input) {
  let promotion;
  try {
    promotion = await Promotion.create({ ...input, status: "new" });
    const channelLabel = input.platform === "x" ? "X" : input.platform[0].toUpperCase() + input.platform.slice(1);
    await AdminNotification.create({
      type: "promotion.created",
      title: "New promotion inquiry",
      message: `${input.name}${input.organization ? ` · ${input.organization}` : ""} sent a ${channelLabel} campaign inquiry.`,
      promotionId: promotion._id,
    });
    return serializePromotion(promotion);
  } catch (error) {
    if (promotion?._id) {
      await AdminNotification.deleteMany({ promotionId: promotion._id }).catch(() => {});
      await Promotion.deleteOne({ _id: promotion._id }).catch(() => {});
    }
    throw error;
  }
}

export async function listAdminPromotions({ page, limit, search = "", status = "" }) {
  const filter = {};
  if (status && status !== "all") {
    if (!PROMOTION_STATUSES.includes(status)) throw new ApiError("Choose a valid promotion status.", 400, "INVALID_PROMOTION_STATUS");
    filter.status = status;
  }
  const query = search.trim().slice(0, 100);
  if (query) {
    const expression = new RegExp(escapeRegex(query), "i");
    filter.$or = [{ name: expression }, { email: expression }, { organization: expression }, { platform: expression }, { message: expression }];
  }
  const [rows, total] = await Promise.all([
    Promotion.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Promotion.countDocuments(filter),
  ]);
  return { rows: rows.map((row) => serializePromotion(row)), total };
}

export async function getAdminPromotion(id) {
  const promotion = await Promotion.findById(safeId(id));
  if (!promotion) throw new ApiError("This promotion inquiry could not be found.", 404, "PROMOTION_NOT_FOUND");
  return serializePromotion(promotion, { detail: true });
}

export async function updateAdminPromotion(id, input, adminId) {
  const promotionId = safeId(id);
  if (Object.keys(input).some((key) => !["status", "adminNotes"].includes(key))) {
    throw new ApiError("The request contains an unsupported field.", 400, "UNEXPECTED_FIELD");
  }
  if (!Object.keys(input).length) throw new ApiError("Add a status or note update before saving.", 422, "EMPTY_UPDATE");
  if (input.status !== undefined && !PROMOTION_STATUSES.includes(input.status)) {
    throw new ApiError("Choose a valid promotion status.", 422, "INVALID_PROMOTION_STATUS");
  }
  if (input.adminNotes !== undefined && (typeof input.adminNotes !== "string" || input.adminNotes.length > 5000)) {
    throw new ApiError("Admin notes must be 5,000 characters or fewer.", 422, "INVALID_ADMIN_NOTES");
  }
  const promotion = await Promotion.findById(promotionId);
  if (!promotion) throw new ApiError("This promotion inquiry could not be found.", 404, "PROMOTION_NOT_FOUND");
  if (input.status !== undefined) promotion.status = input.status;
  if (input.adminNotes !== undefined) promotion.adminNotes = input.adminNotes;
  await promotion.save();
  await AuditLog.create({
    adminId,
    action: input.status ? "promotion.status_changed" : "promotion.notes_updated",
    resource: "promotion",
    resourceId: String(promotion._id),
    metadata: { status: promotion.status, platform: promotion.platform },
  });
  return serializePromotion(promotion, { detail: true });
}
