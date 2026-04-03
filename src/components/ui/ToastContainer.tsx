import { useEffect } from 'react';
import { useStore, type ToastMessage } from '../../store/useStore';
import { XIcon, CheckCircleIcon, InfoIcon, WarningCircleIcon } from '@phosphor-icons/react';

export function ToastContainer() {
  const { toasts, removeToast } = useStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function Toast({ toast, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const icons = {
    success: <CheckCircleIcon className="text-green-500 w-5 h-5 weight-fill" />,
    error: <WarningCircleIcon className="text-red-500 w-5 h-5 weight-fill" />,
    info: <InfoIcon className="text-blue-500 w-5 h-5 weight-fill" />,
  };

  return (
    <div className="bg-light-card border border-light-border shadow-sm hover:shadow-md transition-shadow dark:border-dark-border animate-in slide-in-from-right-4 pointer-events-auto">
      {icons[toast.type]}
      <span className="flex-1 text-sm font-medium">{toast.msg}</span>
      <button 
        type="button"
        title="Dismiss Notification"
        aria-label="Dismiss Notification"
        onClick={onDismiss} 
        className="text-light-secondary hover:text-light-secondary dark:hover:text-light-secondary"
      >
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  );
}