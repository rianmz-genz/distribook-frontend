import React, { forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { createLogger } from '@/utils/logger';

const logger = createLogger('Input');

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', type, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
      logger.debug('Password visibility toggled', { visible: !showPassword });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      logger.debug('Input changed', { 
        name: props.name, 
        hasValue: !!e.target.value 
      });
      props.onChange?.(e);
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={inputType}
            className={`
              w-full px-4 py-2.5 
              ${leftIcon ? 'pl-10' : ''} 
              ${rightIcon || isPassword ? 'pr-10' : ''}
              bg-white dark:bg-gray-800 
              border-2 rounded-xl
              text-gray-900 dark:text-white
              placeholder-gray-400 dark:placeholder-gray-500
              transition-all duration-200
              focus:outline-none focus:ring-0
              ${error 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-500'
              }
              disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed
              ${className}
            `}
            onChange={handleChange}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
          {rightIcon && !isPassword && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
