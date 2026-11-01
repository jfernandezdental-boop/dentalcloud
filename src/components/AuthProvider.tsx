'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getSupabase, hasSupabaseEnv } from '@/lib/supabase/client';
import { getSessionUser, type SessionUser } from '@/lib/supabase/session';
import { canAccessPath, homeForRole } from '@/lib/supabase/roles';
import { signOut as authSignOut } from '@/lib/supabase/auth';

type AuthCtx = {
  user: SessionUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  loading: true,
  refresh: async () => undefined,
  signOut: async () => undefined,
});

const PUBLIC = ['/sign-up-login-screen'];

/** Rutas de operación clínica: el super_admin no debe quedarse ahí */
const CLINIC_OPS = [
  '/',
  '/doctor-agenda',
  '/patient-record',
  '/interactive-odontogram',
  '/billing-statements',
  '/inventory-restock',
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const refresh = useCallback(async () => {
    if (!hasSupabaseEnv()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const u = await getSessionUser();
      setUser(u);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    if (!hasSupabaseEnv()) return;
    const supabase = getSupabase();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      refresh();
    });
    return () => sub.subscription.unsubscribe();
  }, [refresh]);

  useEffect(() => {
    if (loading) return;
    const isPublic = PUBLIC.some((p) => pathname.startsWith(p));

    if (!user && !isPublic) {
      router.replace('/sign-up-login-screen');
      return;
    }

    // Admin global: solo panel plataforma (no inventario / clínica demo)
    if (user?.role === 'super_admin') {
      const onClinicOps = CLINIC_OPS.some(
        (p) => pathname === p || (p !== '/' && pathname.startsWith(p)),
      );
      if (onClinicOps || pathname === '/') {
        router.replace('/global-admin-panel');
        return;
      }
    }

    if (user && !canAccessPath(user.role, pathname)) {
      router.replace(homeForRole(user.role));
    }
  }, [user, loading, pathname, router]);

  const signOut = useCallback(async () => {
    try {
      await authSignOut();
    } finally {
      setUser(null);
      router.replace('/sign-up-login-screen');
    }
  }, [router]);

  const value = useMemo(
    () => ({ user, loading, refresh, signOut }),
    [user, loading, refresh, signOut],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}
