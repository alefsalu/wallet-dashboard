import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

export interface AlertProps {
  variant?: 'error' | 'success' | 'info';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  className,
}) => {
  const styles = {
    error: 'bg-rose-50 border-rose-200 text-rose-800',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const icons = {
    error: <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />,
    info: <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />,
  };

  return (
    <div
      role="alert"
      className={twMerge(
        clsx('flex items-start gap-3 p-4 border rounded-xl text-sm leading-relaxed', styles[variant], className)
      )}
    >
      {icons[variant]}
      <div className="flex-1">
        {title && <h3 className="font-semibold mb-0.5">{title}</h3>}
        <div>{children}</div>
      </div>
    </div>
  );
};
