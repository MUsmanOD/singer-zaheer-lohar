"use client";

import Image from "next/image";
import { useState } from "react";

const FALLBACK = "/images/playlist-placeholder.svg";

export function PlaylistImage({ src, alt, sizes = "(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw", priority = false, className = "" }) {
  const [failedSource, setFailedSource] = useState(null);
  const imageSrc = src && failedSource !== src ? src : FALLBACK;
  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      sizes={sizes}
      preload={priority}
      className={className}
      onError={() => { if (imageSrc !== FALLBACK) setFailedSource(src); }}
    />
  );
}
