import { type HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated';
}

export function Card({ children, variant = 'default', className = '', ...props }: CardProps) {
  const variants = {
    default: 'bg-white border border-gray-200',
    bordered: 'bg-white border-2 border-gray-300',
    elevated: 'bg-white shadow-lg border border-gray-100',
  };

  return (
    <div className={`overflow-hidden rounded-xl ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

export function CardHeader({
  title,
  description,
  children,
  className = '',
  ...props
}: CardHeaderProps) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      {children}
    </div>
  );
}

type CardContentProps = HTMLAttributes<HTMLDivElement>;

export function CardContent({ children, className = '', ...props }: CardContentProps) {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}

type CardFooterProps = HTMLAttributes<HTMLDivElement>;

export function CardFooter({ children, className = '', ...props }: CardFooterProps) {
  return (
    <div className={`flex items-center gap-2 p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}
