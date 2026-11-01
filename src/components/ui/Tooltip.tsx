import React from 'react';

interface TooltipProps {
  label: string;
  children: React.ReactNode;
  side?: 'right' | 'top' | 'bottom';
}

export default function Tooltip({ label, children, side = 'right' }: TooltipProps) {
  const pos =
    side === 'right' ?'left-full ml-2 top-1/2 -translate-y-1/2'
      : side === 'top' ?'bottom-full mb-2 left-1/2 -translate-x-1/2' :'top-full mt-2 left-1/2 -translate-x-1/2';
  return (
    <span className="group/tt relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute z-50 ${pos} whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 shadow-lg transition-opacity duration-150 group-hover/tt:opacity-100`}
      >
        {label}
      </span>
    </span>
  );
}