import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
          // Variants
          {
            // Primary - Emerald green
            'bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500 shadow-sm hover:shadow-md':
              variant === 'default',
            // Secondary - Subtle gray
            'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400':
              variant === 'secondary',
            // Outline - Bordered
            'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:ring-emerald-500':
              variant === 'outline',
            // Ghost - Minimal
            'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-400':
              variant === 'ghost',
            // Danger - Red
            'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-sm':
              variant === 'danger',
          },
          // Sizes
          {
            'px-3 py-1.5 text-xs': size === 'sm',
            'px-4 py-2 text-sm': size === 'md',
            'px-6 py-3 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
