import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface Props {
  toasts: ToastItem[];
  onRemove: (id: number) => void;
}

const icons = { success: CheckCircle, error: AlertCircle, info: Info };
const borderColors = { success: 'border-l-secondary', error: 'border-l-destructive', info: 'border-l-primary' };
const iconColors = { success: 'text-secondary', error: 'text-destructive', info: 'text-primary' };

export default function ToastContainer({ toasts, onRemove }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2">
      {toasts.slice(-3).map(t => (
        <ToastSingle key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastSingle({ toast, onRemove }: { toast: ToastItem; onRemove: (id: number) => void }) {
  const [exiting, setExiting] = useState(false);
  const Icon = icons[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => { setExiting(true); setTimeout(() => onRemove(toast.id), 200); }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div className={`${exiting ? 'toast-exit' : 'toast-enter'} bg-card border border-border border-l-4 ${borderColors[toast.type]} rounded-xl shadow-card px-4 py-3 min-w-[280px] max-w-[360px] flex items-center gap-2`}>
      <Icon className={`w-4 h-4 shrink-0 ${iconColors[toast.type]}`} />
      <span className="text-sm flex-1">{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} className="text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>
    </div>
  );
}
