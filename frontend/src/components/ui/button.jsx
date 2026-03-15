import { cn } from '@/lib/utils';

export function Button({ className, children, variant = 'default', ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'default' && 'brand-gradient text-white hover:shadow-lg px-4 py-2',
        variant === 'outline' && 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 px-4 py-2',
        variant === 'ghost' && 'text-gray-600 hover:bg-gray-100 px-4 py-2',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
