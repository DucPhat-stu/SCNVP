import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'icon';
}

const variants = {
  primary:
    'bg-primary-500 text-white shadow-lg shadow-primary-500/20 hover:bg-primary-400',
  ghost: 'text-gray-300 hover:bg-white/10 hover:text-white',
  outline:
    'border border-white/10 bg-white/5 text-gray-100 hover:border-white/20 hover:bg-white/10',
};

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  icon: 'h-9 w-9 p-0',
};

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
