import { type ReactNode } from 'react';
import { Video, Search, FileText } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-4 py-12 text-center ${className}`}>
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      {description && <p className="mb-6 max-w-sm text-sm text-gray-500">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}

export const EmptyVideoIcon = () => <Video className="h-16 w-16" strokeWidth={1.5} />;
export const EmptySearchIcon = () => <Search className="h-16 w-16" strokeWidth={1.5} />;
export const EmptyFileIcon = () => <FileText className="h-16 w-16" strokeWidth={1.5} />;
