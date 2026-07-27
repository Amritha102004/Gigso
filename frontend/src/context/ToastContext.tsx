import { createContext, useCallback, useContext, useRef, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const recentToasts = useRef<Map<string, number>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timers.current.has(id)) {
      clearTimeout(timers.current.get(id)!);
      timers.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const now = Date.now();
      const key = `${type}-${message}`;
      const lastTriggered = recentToasts.current.get(key);
      if (lastTriggered && now - lastTriggered < 500) {
        return;
      }
      recentToasts.current.set(key, now);

      const id = `${now}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, message }]);
      const timer = setTimeout(() => removeToast(id), 4000);
      timers.current.set(id, timer);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};
