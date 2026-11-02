'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import AppLogo from '@/components/ui/AppLogo';
import Tooltip from '@/components/ui/Tooltip';
import { useAuth } from '@/components/AuthProvider';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  adminOnly?: boolean;
}

const baseItems: NavItem[] = [
  { id: 'nav-dashboard', label: 'Dashboard', href: '/', icon: 'Squares2X2Icon' },
  { id: 'nav-agenda', label: 'Agenda del doctor', href: '/doctor-agenda', icon: 'CalendarDaysIcon' },
  { id: 'nav-patient', label: 'Ficha del paciente', href: '/patient-record', icon: 'UserCircleIcon' },
  { id: 'nav-odontogram', label: 'Odontograma', href: '/interactive-odontogram', icon: 'PuzzlePieceIcon' },
  { id: 'nav-billing', label: 'Facturacion', href: '/billing-statements', icon: 'ReceiptPercentIcon' },
  { id: 'nav-inventory', label: 'Inventario', href: '/inventory-restock', icon: 'CubeIcon' },
  { id: 'nav-staff', label: 'Personal y roles', href: '/clinic-staff', icon: 'UserGroupIcon', adminOnly: true },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const clinicName = user?.clinicName || 'Mi clinica';
  const clinicSub = [user?.clinicCity, user?.clinicPlan ? `Plan ${user.clinicPlan}` : null].filter(Boolean).join(' · ');
  const initials = (t: string) =>
    t
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || '?';

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const items = baseItems.filter((i) => !i.adminOnly || isAdmin);

  return (
    <>
      {mobileOpen ? (
        <div className="fixed inset-0 z-30 bg-foreground/50 lg:hidden animate-fade-in" onClick={onCloseMobile} />
      ) : null}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out ${
          collapsed ? 'lg:w-16' : 'lg:w-60'
        } w-60 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className={`flex h-16 items-center border-b border-white/10 ${collapsed ? 'lg:justify-center lg:px-0 px-4' : 'px-4'} gap-2`}>
          <AppLogo size={36} />
          <span className={`text-lg font-bold tracking-tight ${collapsed ? 'lg:hidden' : ''}`}>DentalCloud</span>
        </div>

        <div className={`border-b border-white/10 p-3 ${collapsed ? 'lg:hidden' : ''}`}>
          <div className="flex w-full items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-left">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
              {initials(clinicName)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{clinicName}</span>
              <span className="block truncate text-[11px] text-sidebar-foreground/70">{clinicSub || 'Clinica'}</span>
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-2 py-4 scrollbar-thin">
          <div>
            <p
              className={`mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/50 ${
                collapsed ? 'lg:hidden' : ''
              }`}
            >
              Operacion clinica
            </p>
            <ul className="space-y-1">
              {items.map((item) => {
                const active = pathname === item.href;
                const link = (
                  <Link
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                      active
                        ? 'bg-primary text-primary-foreground shadow'
                        : 'text-sidebar-foreground/80 hover:bg-white/10 hover:text-sidebar-foreground'
                    } ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}
                  >
                    <Icon name={item.icon} size={20} />
                    <span className={collapsed ? 'lg:hidden' : ''}>{item.label}</span>
                  </Link>
                );
                return (
                  <li key={item.id}>
                    {collapsed ? (
                      <>
                        <span className="hidden lg:block">
                          <Tooltip label={item.label}>{link}</Tooltip>
                        </span>
                        <span className="lg:hidden">{link}</span>
                      </>
                    ) : (
                      link
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className={`flex items-center gap-3 rounded-lg p-2 ${collapsed ? 'lg:justify-center' : ''}`}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
              {initials(user?.fullName || '')}
            </span>
            <div className={`min-w-0 flex-1 ${collapsed ? 'lg:hidden' : ''}`}>
              <p className="truncate text-sm font-semibold">{user?.fullName || ''}</p>
              <p className="truncate text-[11px] text-sidebar-foreground/70">{user?.roleLabel || ''}</p>
            </div>
            <button
              type="button"
              onClick={() => signOut()}
              aria-label="Cerrar sesion"
              className={`rounded-md p-1.5 text-sidebar-foreground/70 hover:bg-white/10 ${collapsed ? 'lg:hidden' : ''}`}
            >
              <Icon name="ArrowRightOnRectangleIcon" size={18} />
            </button>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="mt-2 hidden w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium text-sidebar-foreground/70 hover:bg-white/10 lg:flex"
          >
            <Icon name={collapsed ? 'ChevronDoubleRightIcon' : 'ChevronDoubleLeftIcon'} size={16} />
            {!collapsed && 'Contraer menu'}
          </button>
        </div>
      </aside>
    </>
  );
}
