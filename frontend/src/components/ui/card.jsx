import { cn } from '@/lib/utils';

export function Card({ className, children, ...props }) {
  return (
    <div className={cn('bg-white border border-gray-200 rounded-xl shadow-sm', className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return <div className={cn('px-6 pt-6 pb-2', className)} {...props}>{children}</div>;
}

export function CardTitle({ className, children, ...props }) {
  return <h3 className={cn('text-lg font-semibold text-gray-900', className)} {...props}>{children}</h3>;
}

export function CardContent({ className, children, ...props }) {
  return <div className={cn('px-6 pb-6', className)} {...props}>{children}</div>;
}
