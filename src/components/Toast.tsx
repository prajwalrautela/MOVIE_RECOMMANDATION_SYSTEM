import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Info, Star, Bookmark } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'rating';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
            className="pointer-events-auto flex items-center gap-2.5 rounded-xl border border-slate-700 bg-slate-900/95 px-4 py-3 text-xs font-medium text-white shadow-xl backdrop-blur-md"
            onClick={() => onDismiss(toast.id)}
          >
            {toast.type === 'rating' ? (
              <Star className="h-4 w-4 fill-amber-400 text-amber-400 shrink-0" />
            ) : toast.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <Info className="h-4 w-4 text-sky-400 shrink-0" />
            )}
            <span>{toast.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
