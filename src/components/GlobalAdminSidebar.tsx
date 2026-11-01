'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import AppLogo from '@/components/ui/AppLogo';
import { useAuth } from '@/components/AuthProvider';

const items = [
  { id: 'g-dash', label: 'Resumen plataforma', href: '/global-admin-panel', icon: 'BuildingOffice2Icon' },
  { id: 'g-clinics', label: 'Clínicas / tenants', href: '/global-admin-panel#clinicas', icon: 'BuildingStorefrontIcon' },
  { id: 'g-users', label: 'Usuarios y roles', href: '/global-admin-panel#usuarios', icon: 'UsersIcon' },
  { id: 'g-plans', label: 'Planes y facturación SaaS', href: '/global-admin-panel#planes', icon: 'CreditCardIcon' },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function GlobalAdminSidebar({ collapsed, onToggle, mobileOpen, onCloseMobile }: Props) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-foreground/50 lg:hidden" onClick={onCloseMobile} />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-slate-950 text-slate-100 transition-all duration-300 ${
          collapsed ? 'lg:w-16' : 'lg:w-60'
        } w-60 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className={`flex h-16 items-center border-b border-white/10 gap-2 ${collapsed ? 'lg:justify-center px-2' : 'px-4'}`}>
          <AppLogo size={36} />
          {!collapsed && (
            <div>
              <p className="text-sm font-bold leading-tight">DentalCloud</p>
              <p className="text-[10px] uppercase tracking-wider text-amber-400">Admin global</p>
            </div>
          )}
        </div>

        <div className={`border-b border-white/10 p-3 ${collapsed ? 'lg:hidden' : ''}`}>
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-xs">
            <p className="font-semibold text-amber-300">Plataforma multi-tenant</p>
            <p className="text-slate-400 mt-0.5">No es una clínica operativa</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
          {items.map((item) => {
            const active = pathname.startsWith('/global-admin-panel') && (item.href === '/global-admin-panel' ? true : false);
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  item.href === '/global-admin-panel' && pathname === '/global-admin-panel'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-300 hover:bg-white/10'
                } ${collapsed ? 'lg:justify-center' : ''}`}
              >
                <Icon name={item.icon} size={20} />
                <span className={collapsed ? 'lg:hidden' : ''}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3 space-y-2">
          <div className={`flex items-center gap-2 ${collapsed ? 'lg:justify-center' : ''}`}>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-slate-950">
              AG
            </span>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{user?.fullName || 'Admin global'}</p>
                <p className="truncate text-[11px] text-slate-400">{user?.email}</p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => signOut()}
            className="w-full rounded-lg border border-white/15 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10"
          >
            Cerrar sesión
          </button>
          <button
            type="button"
            onClick={onToggle}
            className="hidden w-full items-center justify-center gap-2 rounded-lg py-2 text-xs text-slate-400 hover:bg-white/10 lg:flex"
          >
            <Icon name={collapsed ? 'ChevronDoubleRightIcon' : 'ChevronDoubleLeftIcon'} size={16} />
            {!collapsed && 'Contraer'}
          </button>
        </div>
      </aside>
    </>
  );
}
