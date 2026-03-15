import { cn } from '@/lib/utils';
import React from 'react';

export const Input = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-sans text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all',
        className
      )}
      {...props}
    />
  );
});

Input.displayName = 'Input';
