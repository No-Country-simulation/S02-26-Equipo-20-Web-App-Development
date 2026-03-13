import { useState, type InputHTMLAttributes, type Ref } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  ref?: Ref<HTMLInputElement>;
}

export function Input({
  label,
  error,
  helperText,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  id,
  type,
  ref,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';

  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const widthClass = fullWidth ? 'w-full' : '';
  const resolvedType = isPasswordField ? (showPassword ? 'text' : 'password') : type;

  const baseInputStyles =
    'w-full flex h-10 rounded-lg border bg-white px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

  const errorStyles = error
    ? 'border-red-500 focus-visible:ring-red-500'
    : 'border-gray-300 focus-visible:ring-primary-600';

  const effectiveRightIcon = isPasswordField ? null : rightIcon;
  const paddingStyles = leftIcon ? 'pl-10' : isPasswordField || effectiveRightIcon ? 'pr-10' : '';

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
          type={resolvedType}
          className={`${baseInputStyles} ${errorStyles} ${paddingStyles} ${className}`}
          {...props}
        />

        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none disabled:pointer-events-none"
            disabled={props.disabled}
            tabIndex={-1}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}

        {!isPasswordField && effectiveRightIcon && (
          <div className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400">
            {effectiveRightIcon}
          </div>
        )}
      </div>

      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      {helperText && !error && <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
}
