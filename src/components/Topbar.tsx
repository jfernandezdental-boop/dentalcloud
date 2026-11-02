'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface TopbarProps {
  onOpenMobile: () => void;
  /** true = panel admin global (sin métricas de una clínica demo) */
  platformMode?: boolean;
}

const notificationsClinic: { id: string; text: string; time: string; tone: string }[] = [];
const notificationsPlatform: { id: string; text: string; time: string; tone: string }[] = [];

export default function Topbar({ onOpenMobile, platformMode = false }: TopbarProps) {
  const [openNotif, setOpenNotif] = useState(false);
  const notifications = platformMode ? notificationsPlatform : notificationsClinic;

  return (
    <header className="no-print sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-card/90 px-4 backdrop-blur lg:px-6 2xl:px-10">
      <button
        onClick={onOpenMobile}
        aria-label="Abrir menú"
        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted lg:hidden"
      >
        <Icon name="Bars3Icon" size={22} />
      </button>

      {platformMode ? (
        <div className="hidden sm:block">
          <p className="text-sm font-bold">Panel plataforma</p>
          <p className="text-[11px] text-muted-foreground">Multi-tenant · sin datos de una sola clínica</p>
        </div>
      ) : (
        <div className="relative hidden max-w-md flex-1 sm:block">
          <Icon
            name="MagnifyingGlassIcon"
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            placeholder="Buscar paciente, cédula o proforma…"
            aria-label="Búsqueda global"
            className="w-full rounded-lg border border-input bg-muted/50 py-2 pl-10 pr-16 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:ring-2 focus:ring-ring/20"
          />
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        {platformMode && (
          <span className="hidden items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-700 md:inline-flex">
            Admin global
          </span>
        )}

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenNotif((v) => !v)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
            aria-label="Notificaciones"
          >
            <Icon name="BellIcon" size={20} />
          </button>
          {openNotif && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-border bg-card p-2 shadow-lg">
              {notifications.length === 0 && (
                <p className="px-3 py-4 text-center text-sm text-muted-foreground">No tienes notificaciones.</p>
              )}
              {notifications.map((n) => (
                <div key={n.id} className="rounded-lg px-3 py-2 text-sm hover:bg-muted">
                  <p className={n.tone}>{n.text}</p>
                  <p className="text-[11px] text-muted-foreground">{n.time}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <Link
          href="/sign-up-login-screen"
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
          aria-label="Cuenta"
        >
          <Icon name="UserCircleIcon" size={22} />
        </Link>
      </div>
    </header>
  );
}
