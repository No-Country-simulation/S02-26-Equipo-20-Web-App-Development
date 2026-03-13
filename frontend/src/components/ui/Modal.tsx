import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  header?: ReactNode;
  disabled?: boolean;
  children: ReactNode;
}

export function Modal({ open, onClose, title, subtitle, header, disabled, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90dvh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {header ?? (
          <div className="mb-6 flex items-center justify-between">
            <div>
              {title && <h2 className="text-xl font-bold text-gray-900">{title}</h2>}
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              disabled={disabled}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50">
              <X className="h-6 w-6" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
