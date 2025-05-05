import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'primary';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'md', className = '', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    
    const variantStyles = {
      default: 'bg-gray-900 text-white hover:bg-gray-700 focus:ring-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600',
      primary: 'bg-yellow-400 text-blue-900 hover:bg-yellow-300 focus:ring-yellow-400 font-bold transform hover:-translate-y-1 transition-all shadow-lg',
      outline: 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700',
      secondary: 'bg-indigo-100 text-indigo-900 hover:bg-indigo-200 focus:ring-indigo-500 dark:bg-indigo-700 dark:text-indigo-100 dark:hover:bg-indigo-600',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white',
      link: 'bg-transparent text-indigo-600 hover:underline focus:ring-indigo-500 dark:text-indigo-400'
    };
    
    const sizeStyles = {
      sm: 'text-sm px-3 py-1.5 rounded',
      md: 'text-base px-4 py-2 rounded-md',
      lg: 'text-lg px-6 py-3 rounded-lg',
      xl: 'text-xl px-8 py-4 rounded-full'
    };
    
    const combinedClassName = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      className
    );
    
    return (
      <button
        className={combinedClassName}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);