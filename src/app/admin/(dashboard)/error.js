"use client";

import { AppError } from "@/components/app-error";

export default function AdminDashboardError({ error, reset }) {
  return <AppError error={error} reset={reset} admin />;
}
