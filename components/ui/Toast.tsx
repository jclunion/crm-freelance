'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// Types
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  titre: string;
  message?: string;
  duree?: number;
}

interface ToastContextType {
  toasts: Toast[];
  ajouterToast: (toast: Omit<Toast, 'id'>) => void;
  supprimerToast: (id: string) => void;
  success: (titre: string, message?: string) => void;
  error: (titre: string, message?: string) => void;
  info: (titre: string, message?: string) => void;
  warning: (titre: string, message?: string) => void;
}

// Contexte
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Hook personnalisé
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast doit être utilisé dans un ToastProvider');
  }
  return context;
}

// Configuration des icônes et couleurs par type
const configToast: Record<ToastType, { icon: typeof CheckCircle2; couleurs: string }> = {
  success: {
    icon: CheckCircle2,
    couleurs: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300',
  },
  error: {
    icon: AlertCircle,
    couleurs: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300',
  },
  info: {
    icon: Info,
    couleurs: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300',
  },
  warning: {
    icon: AlertTriangle,
    couleurs: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300',
  },
};

// Composant Toast individuel
function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const config = configToast[toast.type];
  const Icon = config.icon;

  return (
    <div
      className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg animate-slide-up ${config.couleurs}`}
      role="alert"
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium">{toast.titre}</p>
        {toast.message && (
          <p className="mt-1 text-sm opacity-90">{toast.message}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 rounded-lg p-1 opacity-70 transition-opacity hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// Conteneur des toasts
function ToastContainer({ toasts, onClose }: { toasts: Toast[]; onClose: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4 sm:p-6">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => onClose(toast.id)} />
      ))}
    </div>
  );
}

// Provider
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const supprimerToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const ajouterToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const nouveauToast: Toast = { ...toast, id };
    
    setToasts((prev) => [...prev, nouveauToast]);

    // Auto-suppression après la durée spécifiée (défaut: 5s)
    const duree = toast.duree ?? 5000;
    if (duree > 0) {
      setTimeout(() => {
        supprimerToast(id);
      }, duree);
    }
  }, [supprimerToast]);

  // Raccourcis pour chaque type
  const success = useCallback((titre: string, message?: string) => {
    ajouterToast({ type: 'success', titre, message });
  }, [ajouterToast]);

  const error = useCallback((titre: string, message?: string) => {
    ajouterToast({ type: 'error', titre, message, duree: 8000 }); // Plus long pour les erreurs
  }, [ajouterToast]);

  const info = useCallback((titre: string, message?: string) => {
    ajouterToast({ type: 'info', titre, message });
  }, [ajouterToast]);

  const warning = useCallback((titre: string, message?: string) => {
    ajouterToast({ type: 'warning', titre, message, duree: 6000 });
  }, [ajouterToast]);

  return (
    <ToastContext.Provider value={{ toasts, ajouterToast, supprimerToast, success, error, info, warning }}>
      {children}
      <ToastContainer toasts={toasts} onClose={supprimerToast} />
    </ToastContext.Provider>
  );
}
