'use client';
import React, { useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'md' | 'lg' | 'xl';
}

const sizes = { md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

export default function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Ventana movible: se arrastra desde la barra del título (solo en pantallas >= sm; en celular es una hoja inferior).
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number; rect: DOMRect } | null>(null);

  useEffect(() => {
    if (open) setPos({ x: 0, y: 0 });
  }, [open]);

  const onDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button, a, input, select, textarea')) return;
    if (!window.matchMedia('(min-width: 640px)').matches) return;
    const rect = panelRef.current?.getBoundingClientRect();
    if (!rect) return;
    drag.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y, rect };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    // Límites: la barra del título siempre queda visible para poder volver a agarrarla.
    const minDx = -(d.rect.left + d.rect.width - 80);
    const maxDx = window.innerWidth - 80 - d.rect.left;
    const minDy = -d.rect.top;
    const maxDy = window.innerHeight - 56 - d.rect.top;
    const dx = Math.min(Math.max(e.clientX - d.sx, minDx), maxDx);
    const dy = Math.min(Math.max(e.clientY - d.sy, minDy), maxDy);
    setPos({ x: d.ox + dx, y: d.oy + dy });
  };
  const onDragEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    drag.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* el puntero ya se liberó */
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-foreground/50 animate-fade-in" onClick={onClose} />
      <div
        ref={panelRef}
        style={{ translate: `${pos.x}px ${pos.y}px` }}
        className={`relative flex max-h-[92vh] w-full ${sizes[size]} animate-scale-in flex-col rounded-t-2xl sm:rounded-2xl border border-border bg-card text-card-foreground shadow-2xl`}
      >
        <div
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragEnd}
          onDoubleClick={(e) => {
            if (!(e.target as HTMLElement).closest('button')) setPos({ x: 0, y: 0 });
          }}
          title="Arrastra para mover · doble clic para centrar"
          className="flex select-none items-start justify-between gap-4 border-b border-border px-5 py-4 sm:cursor-move sm:touch-none"
        >
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Icon name="XMarkIcon" size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-muted/40 px-5 py-3 rounded-b-2xl">{footer}</div>}
      </div>
    </div>
  );
}