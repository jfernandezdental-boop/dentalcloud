import React from 'react';

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent';

const tones: Record<Tone, string> = {
  success: 'bg-success/15 text-success border-success/30',
  warning: 'bg-warning/15 text-warning border-warning/30',
  danger: 'bg-destructive/10 text-destructive border-destructive/30',
  info: 'bg-primary/10 text-primary border-primary/30',
  neutral: 'bg-muted text-muted-foreground border-border',
  accent: 'bg-accent/10 text-accent border-accent/30',
};

interface BadgeProps {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export default function Badge({ tone = 'neutral', children, className = '', dot = false }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${tones[tone]} ${className}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}