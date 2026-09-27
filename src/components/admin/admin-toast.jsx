"use client";

import { CheckCircle2, CircleAlert, X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const ToastContext = createContext(null);

export function AdminToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const toast = useCallback((message, variant = "success") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setItems((current) => [...current, { id, message, variant }]);
    window.setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), 4800);
  }, []);
  const dismiss = useCallback((id) => setItems((current) => current.filter((item) => item.id !== id)), []);
  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="admin-toasts" aria-live="polite" aria-atomic="false">
        {items.map((item) => <div className={`admin-toast admin-toast--${item.variant}`} key={item.id} role="status">
          {item.variant === "error" ? <CircleAlert size={17} /> : <CheckCircle2 size={17} />}<span>{item.message}</span><button type="button" className="admin-toast__close" onClick={() => dismiss(item.id)} aria-label="Dismiss notification"><X size={15} /></button>
        </div>)}
      </div>
    </ToastContext.Provider>
  );
}

export function useAdminToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useAdminToast must be used inside AdminToastProvider.");
  return context.toast;
}
