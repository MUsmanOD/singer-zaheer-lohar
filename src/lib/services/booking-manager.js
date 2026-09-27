import { createHmac } from "node:crypto";
import mongoose from "mongoose";
import { ApiError } from "@/lib/api/response";
import { AdminNotification } from "@/lib/db/models/AdminNotification";
import { AuditLog } from "@/lib/db/models/AuditLog";
import { Booking, BOOKING_STATUSES } from "@/lib/db/models/Booking";
import { BookingSubmission } from "@/lib/db/models/BookingSubmission";
import "@/lib/db/models/Promotion";

const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;

function canRunWithoutTransactions(error) {
  return error?.code === 20
    || error?.codeName === "IllegalOperation"
    || /transaction numbers are only allowed|does not support transactions|replica set member or mongos/i.test(error?.message || "");
}

async function withTransaction(work) {
  const session = await mongoose.startSession();
  try {
    return await session.withTransaction(() => work(session));
  } catch (error) {
    if (!canRunWithoutTransactions(error)) throw error;
    return work(null);
  } finally {
    await session.endSession();
  }
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function safeId(id, label = "booking") {
  if (!mongoose.Types.ObjectId.isValid(id) || String(new mongoose.Types.ObjectId(id)) !== String(id)) {
    throw new ApiError(`This ${label} could not be found.`, 404, `${label.toUpperCase()}_NOT_FOUND`);
  }
  return new mongoose.Types.ObjectId(id);
}

function dateOnly(date) {
  return date ? new Date(date).toISOString().slice(0, 10) : "";
}

function serializeBooking(value, { detail = false } = {}) {
  const booking = typeof value.toObject === "function" ? value.toObject() : value;
  const result = {
    id: String(booking._id || booking.id),
    fullName: booking.fullName,
    email: booking.email,
    phone: booking.phone,
    eventType: booking.eventType,
    eventDate: dateOnly(booking.eventDate),
    startTime: booking.startTime,
    endTime: booking.endTime,
    venue: booking.venue,
    city: booking.city,
    country: booking.country,
    expectedAudience: booking.expectedAudience,
    status: booking.status,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  };
  if (detail) Object.assign(result, { message: booking.message || "", adminNotes: booking.adminNotes || "" });
  return result;
}

function fingerprint(data) {
  const secret = process.env.BOOKING_DEDUPE_SECRET || process.env.SESSION_SECRET || process.env.MONGODB_URI;
  if (!secret) throw new ApiError("Booking protection is not configured.", 503, "BOOKING_PROTECTION_UNAVAILABLE");
  const material = [data.email, data.phone, data.eventDateLabel, data.startTime, data.venue.toLowerCase(), data.city.toLowerCase(), data.country.toLowerCase()]
    .map((part) => part.trim().toLowerCase()).join("\u001f");
  return createHmac("sha256", secret).update(material).digest("hex");
}

async function reserveSubmission(hash) {
  await BookingSubmission.init();
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await BookingSubmission.create({ fingerprint: hash, expiresAt: new Date(Date.now() + DUPLICATE_WINDOW_MS) });
    } catch (error) {
      if (error?.code !== 11000) throw error;
      const previous = await BookingSubmission.findOne({ fingerprint: hash }).select("+fingerprint");
      if (previous && previous.expiresAt > new Date()) {
        throw new ApiError("A similar booking request was already received recently. If you need to change it, contact the team directly.", 409, "DUPLICATE_BOOKING");
      }
      if (previous) await BookingSubmission.deleteOne({ _id: previous._id });
    }
  }
  throw new ApiError("A similar booking request was already received recently.", 409, "DUPLICATE_BOOKING");
}

export async function createBooking(input) {
  const submission = await reserveSubmission(fingerprint(input));
  let booking;
  try {
    booking = await Booking.create({ ...input, status: "pending" });
    const notification = await AdminNotification.create({
      type: "booking.created",
      title: "New performance booking",
      message: `${input.fullName} requested a ${input.eventType} performance for ${input.eventDateLabel}.`,
      bookingId: booking._id,
    });
    return { booking: serializeBooking(booking), notificationId: String(notification._id) };
  } catch (error) {
    if (booking?._id) {
      await AdminNotification.deleteMany({ bookingId: booking._id }).catch(() => {});
      await Booking.deleteOne({ _id: booking._id }).catch(() => {});
    }
    await BookingSubmission.deleteOne({ _id: submission._id }).catch(() => {});
    throw error;
  }
}

export async function listAdminBookings({ page, limit, search = "", status = "" }) {
  const filter = {};
  if (status && status !== "all") {
    if (!BOOKING_STATUSES.includes(status)) throw new ApiError("Choose a valid booking status.", 400, "INVALID_BOOKING_STATUS");
    filter.status = status;
  }
  if (search.trim()) {
    const expression = new RegExp(escapeRegex(search.trim().slice(0, 100)), "i");
    filter.$or = [{ fullName: expression }, { email: expression }, { venue: expression }, { city: expression }];
  }
  const [rows, total] = await Promise.all([
    Booking.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Booking.countDocuments(filter),
  ]);
  return { rows: rows.map((row) => serializeBooking(row)), total };
}

export async function getAdminBooking(id) {
  const booking = await Booking.findById(safeId(id));
  if (!booking) throw new ApiError("This booking could not be found.", 404, "BOOKING_NOT_FOUND");
  return serializeBooking(booking, { detail: true });
}

export async function updateAdminBooking(id, input, adminId) {
  const bookingId = safeId(id);
  if (!Object.keys(input).length) throw new ApiError("Add a status or note update before saving.", 422, "EMPTY_UPDATE");
  if (input.status !== undefined && !BOOKING_STATUSES.includes(input.status)) {
    throw new ApiError("Choose a valid booking status.", 422, "INVALID_BOOKING_STATUS");
  }
  if (input.adminNotes !== undefined && (typeof input.adminNotes !== "string" || input.adminNotes.length > 5000)) {
    throw new ApiError("Admin notes must be 5,000 characters or fewer.", 422, "INVALID_ADMIN_NOTES");
  }
  let updated;
  await withTransaction(async (session) => {
    let query = Booking.findById(bookingId);
    if (session) query = query.session(session);
    const booking = await query;
    if (!booking) throw new ApiError("This booking could not be found.", 404, "BOOKING_NOT_FOUND");
    if (input.status !== undefined) booking.status = input.status;
    if (input.adminNotes !== undefined) booking.adminNotes = input.adminNotes;
    await booking.save(session ? { session } : undefined);
    const log = new AuditLog({
      adminId,
      action: input.status ? "booking.status_changed" : "booking.notes_updated",
      resource: "booking",
      resourceId: String(booking._id),
      metadata: { status: booking.status, eventDate: dateOnly(booking.eventDate) },
    });
    await log.save(session ? { session } : undefined);
    updated = serializeBooking(booking, { detail: true });
  });
  return updated;
}

export async function listAdminNotifications() {
  const [rows, unreadCount] = await Promise.all([
    AdminNotification.find({}).sort({ createdAt: -1 }).limit(8)
      .populate("bookingId", "fullName eventDate eventType status")
      .populate("promotionId", "name status")
      .lean(),
    AdminNotification.countDocuments({ isRead: false }),
  ]);
  return {
    unreadCount,
    items: rows.map((row) => ({
      id: String(row._id),
      type: row.type,
      title: row.title,
      message: row.message,
      isRead: Boolean(row.isRead),
      createdAt: row.createdAt,
      bookingId: row.bookingId?._id ? String(row.bookingId._id) : "",
      promotionId: row.promotionId?._id ? String(row.promotionId._id) : "",
      contactName: row.bookingId?.fullName || row.promotionId?.name || "",
      bookingStatus: row.bookingId?.status || "",
      promotionStatus: row.promotionId?.status || "",
    })),
  };
}

export async function markAdminNotificationRead(id) {
  const notificationId = safeId(id, "notification");
  const notification = await AdminNotification.findByIdAndUpdate(notificationId, {
    $set: { isRead: true, readAt: new Date() },
  }, { new: true }).lean();
  if (!notification) throw new ApiError("This notification could not be found.", 404, "NOTIFICATION_NOT_FOUND");
  return { id: String(notification._id), isRead: true };
}
