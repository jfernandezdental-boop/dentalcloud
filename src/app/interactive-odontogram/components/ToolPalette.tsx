'use client';
import React from 'react';
import { ToolId, tools } from '@/lib/odontogram';
import ToolGlyph from './ToolGlyph';

interface ToolPaletteProps {
  active: ToolId;
  onSelect: (id: ToolId) => void;
  disabled?: boolean;
}

export default function ToolPalette({ active, onSelect, disabled }: ToolPaletteProps) {
  return (
    <div className="flex flex-wrap gap-2" role="toolbar" aria-label="Herramientas del odontograma">
      {tools.map((t) => {
        const selected = active === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            disabled={disabled}
            aria-pressed={selected}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
              selected
                ? 'border-sidebar bg-sidebar text-sidebar-foreground shadow-md'
                : 'border-input bg-card hover:border-primary/60 hover:bg-primary/5'
            }`}
          >
            <ToolGlyph id={t.id} size={16} />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}