'use client';
import React from 'react';

export const fld =
  'w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/30';

export function Field({
  label,
  required,
  children,
  className = '',
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1 block font-medium">
        {label}
        {required && <span className="ml-0.5 text-destructive" title="Campo obligatorio">*</span>}
      </span>
      {children}
    </label>
  );
}

export const money = (n: number) => new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(n);
export const today = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD en hora local

export function btnPrimary(disabled?: boolean) {
  return `inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95 ${disabled ? 'opacity-60' : ''}`;
}
export const btnGhost =
  'inline-flex items-center gap-2 rounded-lg border border-input bg-card px-3 py-2 text-sm font-semibold transition-all hover:bg-muted active:scale-95';
