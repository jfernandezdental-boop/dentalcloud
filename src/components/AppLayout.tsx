'use client';
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import GlobalAdminSidebar from '@/components/GlobalAdminSidebar';
import Topbar from '@/components/Topbar';
import { useAuth } from '@/components/AuthProvider';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  const isGlobal =
    user?.role === 'super_admin' || pathname.startsWith('/global-admin-panel');

  return (
    <div className="min-h-screen bg-background">
      {isGlobal ? (
        <GlobalAdminSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
      ) : (
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
      )}
      <div
        className={`transition-all duration-300 ${
          collapsed ? 'lg:pl-16' : 'lg:pl-60'
        }`}
      >
        <Topbar onOpenMobile={() => setMobileOpen(true)} platformMode={isGlobal} />
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
