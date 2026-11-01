import React from 'react';

interface RequiredMarkProps {
  required?: boolean;
}

export function RequiredMark({ required = true }: RequiredMarkProps) {
  if (!required) return null;
  return (
    <span className="ml-0.5 text-destructive" aria-hidden="true" title="Campo obligatorio">
      *
    </span>
  );
}

interface FieldErrorProps {
  id: string;
  message?: string;
}

export function FieldError({ id, message }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p id={`${id}-error`} role="alert" className="mt-1 flex items-start gap-1 text-xs font-medium text-destructive">
      <svg viewBox="0 0 20 20" fill="currentColor" className="mt-px h-3.5 w-3.5 flex-shrink-0" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
      <span>{message}</span>
    </p>
  );
}

export const inputBase =
  'w-full rounded-lg border bg-card px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2';

export function inputClass(hasError: boolean, extra = ''): string {
  const state = hasError
    ? 'border-destructive focus:border-destructive focus:ring-destructive/20' :'border-input focus:border-primary focus:ring-ring/20';
  return `${inputBase} ${state} ${extra}`.trim();
}

export function ariaFor(id: string, hasError: boolean) {
  return {
    'aria-invalid': hasError ? (true as const) : undefined,
    'aria-describedby': hasError ? `${id}-error` : undefined,
  };
}

export function RequiredLegend() {
  return (
    <p className="text-xs text-muted-foreground">
      <span className="text-destructive" aria-hidden="true">*</span> Campo obligatorio
    </p>
  );
}
