"use client";

import { AppError } from "@/components/app-error";

export default function PlaylistsError({ error, reset }) {
  return <AppError error={error} reset={reset} />;
}
