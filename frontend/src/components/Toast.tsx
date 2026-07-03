import { useEffect, useState } from 'react';
import { useToast, type ToastType } from '../context/ToastContext';
import './Toast.css';

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  id: string;
  type: ToastType;
  message: string;
  onRemove: (id: string) => void;
}

const ToastItem = ({ id, type, message, onRemove }: ToastItemProps) => {
  const [exiting, setExiting] = useState(false);

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => onRemove(id), 300);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(id), 300);
    }, 3700);
    return () => clearTimeout(timer);
  }, [id, onRemove]);

  return (
    <div className={`toast toast--${type} ${exiting ? 'toast--exit' : 'toast--enter'}`}>
      <span className="toast__icon">{ICONS[type]}</span>
      <span className="toast__message">{message}</span>
      <button className="toast__close" onClick={handleClose} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
};
