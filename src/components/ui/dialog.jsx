"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";

export function Dialog({ open, onOpenChange, title, description, children, className = "" }) {
  const dialogRef = useRef(null);
  const generatedId = useId().replace(/:/g, "");
  const titleId = `${generatedId}-title`;
  const descriptionId = `${generatedId}-description`;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={`app-dialog ${className}`}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => { event.preventDefault(); onOpenChange(false); }}
      onClick={(event) => { if (event.target === dialogRef.current) onOpenChange(false); }}
    >
      <div className="app-dialog__content">
        <div className="app-dialog__heading"><div><h2 id={titleId}>{title}</h2>{description ? <p id={descriptionId}>{description}</p> : null}</div><button type="button" className="icon-button" onClick={() => onOpenChange(false)} aria-label="Close dialog"><X size={18} /></button></div>
        {children}
      </div>
    </dialog>
  );
}
