import React from 'react';
import Icon from '@/components/ui/AppIcon';

type Tone = 'default' | 'alert' | 'warning' | 'success' | 'hero';

interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  deltaDirection?: 'up' | 'down' | 'flat';
  deltaGood?: boolean;
  helper?: string;
  icon: string;
  tone?: Tone;
  className?: string;
  children?: React.ReactNode;
}

const toneStyles: Record<Tone, string> = {
  default: 'bg-card border-border',
  alert: 'bg-destructive/10 border-destructive/30',
  warning: 'bg-warning/10 border-warning/30',
  success: 'bg-success/10 border-success/30',
  hero: 'bg-sidebar border-sidebar text-sidebar-foreground',
};

export default function MetricCard({
  label,
  value,
  unit,
  delta,
  deltaDirection = 'flat',
  deltaGood = true,
  helper,
  icon,
  tone = 'default',
  className = '',
  children,
}: MetricCardProps) {
  const isHero = tone === 'hero';
  const deltaColor = deltaGood ? 'text-success' : 'text-destructive';
  const arrow = deltaDirection === 'up' ? 'ArrowTrendingUpIcon' : deltaDirection === 'down' ? 'ArrowTrendingDownIcon' : 'MinusIcon';

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 transition-shadow duration-200 hover:shadow-md ${toneStyles[tone]} ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={`text-[13px] font-medium tracking-wide ${isHero ? 'text-sidebar-foreground/80' : 'text-muted-foreground'}`}>{label}</p>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            isHero ? 'bg-primary text-primary-foreground' : tone === 'alert' ? 'bg-destructive text-destructive-foreground' : tone === 'warning' ? 'bg-warning text-warning-foreground' : 'bg-primary/10 text-primary'
          }`}
        >
          <Icon name={icon} size={18} />
        </span>
      </div>
      <div className="mt-3">
        <div className="flex items-baseline gap-1.5">
          <span className={`tabular font-bold ${isHero ? 'text-hero-xl' : 'text-3xl'}`}>{value}</span>
          {unit && <span className={`text-sm font-medium ${isHero ? 'text-sidebar-foreground/70' : 'text-muted-foreground'}`}>{unit}</span>}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
          {delta && (
            <span className={`inline-flex items-center gap-1 font-semibold ${isHero ? 'text-sidebar-foreground' : deltaColor}`}>
              <Icon name={arrow} size={14} />
              {delta}
            </span>
          )}
          {helper && <span className={isHero ? 'text-sidebar-foreground/70' : 'text-muted-foreground'}>{helper}</span>}
        </div>
      </div>
      {children}
    </div>
  );
}