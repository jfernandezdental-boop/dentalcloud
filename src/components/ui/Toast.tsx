'use client';
import React, { useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ToastProps {
  message: string;
  tone?: 'success' | 'error' | 'info';
  onDone: () => void;
}

const toneStyles = {
  success: 'bg-success text-success-foreground',
  error: 'bg-destructive text-destructive-foreground',
  info: 'bg-primary text-primary-foreground',
};

export default function Toast({ message, tone = 'success', onDone }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className={`fixed bottom-5 right-5 z-[60] flex animate-slide-up items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-xl ${toneStyles[tone]}`}>
      <Icon name={tone === 'error' ? 'ExclamationTriangleIcon' : 'CheckCircleIcon'} size={18} />
      {message}
    </div>
  );
}