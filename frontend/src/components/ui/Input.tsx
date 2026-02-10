import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      leftIcon,
      rightIcon,
      className = '',
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const widthClass = fullWidth ? 'w-full' : '';

    const baseInputStyles =
      'flex h-10 rounded-lg border bg-white px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

    const errorStyles = error
      ? 'border-red-500 focus-visible:ring-red-500'
      : 'border-gray-300 focus-visible:ring-primary-600';

    const paddingStyles = leftIcon ? 'pl-10' : rightIcon ? 'pr-10' : '';

    return (
      <div className={widthClass}>
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">{leftIcon}</div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`${baseInputStyles} ${errorStyles} ${paddingStyles} ${className}`}
            {...props}
          />

          {rightIcon && (
            <div className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}

        {helperText && !error && <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
