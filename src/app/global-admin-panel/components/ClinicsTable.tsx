'use client';
import React, { useMemo, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import Badge from '@/components/ui/Badge';
import Toast from '@/components/ui/Toast';
import EmptyState from '@/components/ui/EmptyState';
import CreateClinicModal, { NewClinic } from './CreateClinicModal';

type ClinicStatus = 'Activa' | 'En prueba' | 'Suspendida' | 'Pago vencido';

interface Clinic {
  id: string;
  name: string;
  city: string;
  admin: string;
  plan: 'Inicial' | 'Clínica Pro' | 'Red de clínicas';
  doctors: number;
  admins: number;
  patients: number;
  mrr: number;
  created: string;
  status: ClinicStatus;
}

const initial: Clinic[] = [
  { id: 'cl-001', name: 'Sonrisa Boreal', city: 'Quito', admin: 'MarianaRosero', plan: 'Clínica Pro', doctors: 3, admins: 3, patients: 1284, mrr: 79, created: '14/03/2024', status: 'Activa' },
  { id: 'cl-002', name: 'Dental Costa Azul', city: 'Guayaquil', admin: 'Julio Cevallos', plan: 'Red de clínicas', doctors: 9, admins: 6, patients: 1176, mrr: 199, created: '02/08/2023', status: 'Activa' },
  { id: 'cl-003', name: 'OdontoSierra', city: 'Ambato', admin: 'Verónica Tapia', plan: 'Clínica Pro', doctors: 4, admins: 3, patients: 982, mrr: 79, created: '21/01/2025', status: 'Activa' },
  { id: 'cl-004', name: 'Clínica Perla', city: 'Cuenca', admin: 'Rodrigo Maldonado', plan: 'Clínica Pro', doctors: 5, admins: 4, patients: 874, mrr: 79, created: '30/05/2024', status: 'Activa' },
  { id: 'cl-005', name: 'Dentis Austro', city: 'Loja', admin: 'Estefanía Carrión', plan: 'Inicial', doctors: 2, admins: 2, patients: 611, mrr: 29, created: '11/11/2025', status: 'Pago vencido' },
  { id: 'cl-006', name: 'Sonríe Manta', city: 'Manta', admin: 'Cristian Zambrano', plan: 'Inicial', doctors: 1, admins: 1, patients: 244, mrr: 29, created: '19/09/2026', status: 'En prueba' },
  { id: 'cl-007', name: 'Odonto Imbabura', city: 'Ibarra', admin: 'Lorena Chandi', plan: 'Inicial', doctors: 1, admins: 1, patients: 188, mrr: 29, created: '03/04/2025', status: 'Suspendida' },
  { id: 'cl-008', name: 'Centro Dental Riobamba', city: 'Riobamba', admin: 'Fabián Guamán', plan: 'Clínica Pro', doctors: 3, admins: 2, patients: 702, mrr: 79, created: '08/02/2024', status: 'Activa' },
  { id: 'cl-009', name: 'Dental Galápagos', city: 'Puerto Ayora', admin: 'Nataly Bucheli', plan: 'Inicial', doctors: 1, admins: 1, patients: 96, mrr: 29, created: '25/10/2026', status: 'En prueba' },
  { id: 'cl-010', name: 'Sonrisas del Oro', city: 'Machala', admin: 'Henry Jaramillo', plan: 'Clínica Pro', doctors: 4, admins: 3, patients: 835, mrr: 79, created: '17/06/2024', status: 'Pago vencido' },
];

const statusTone: Record<ClinicStatus, 'success' | 'info' | 'neutral' | 'danger'> = {
  Activa: 'success',
  'En prueba': 'info',
  Suspendida: 'neutral',
  'Pago vencido': 'danger',
};

const filters: ('Todas' | ClinicStatus)[] = ['Todas', 'Activa', 'En prueba', 'Pago vencido', 'Suspendida'];

export default function ClinicsTable() {
  const [clinics, setClinics] = useState<Clinic[]>(initial);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof filters)[number]>('Todas');
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState('');
  const [removing, setRemoving] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(6);
  const [sortKey, setSortKey] = useState<'patients' | 'mrr' | 'name'>('patients');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = clinics.filter(
      (c) =>
        (filter === 'Todas' || c.status === filter) &&
        (q === '' || c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q) || c.admin.toLowerCase().includes(q))
    );
    return [...list].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'name') return a.name.localeCompare(b.name) * dir;
      return (a[sortKey] - b[sortKey]) * dir;
    });
  }, [clinics, query, filter, sortKey, sortDir]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * perPage, current * perPage);

  const toggleSort = (k: typeof sortKey) => {
    if (sortKey === k) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(k);
      setSortDir('desc');
    }
  };

  const changeStatus = (id: string, status: ClinicStatus) => {
    setClinics((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    setToast(`Estado de la clínica actualizado a «${status}»`);
  };

  const remove = (id: string, name: string) => {
    setRemoving(id);
    setTimeout(() => {
      setClinics((prev) => prev.filter((c) => c.id !== id));
      setRemoving('');
      setToast(`Clínica «${name}» eliminada de la plataforma`);
    }, 300);
  };

  const create = (n: NewClinic) => {
    // Backend integration: POST /api/tenants (provision DB schema, admin user and welcome email)
    const next: Clinic = {
      id: `cl-${String(clinics.length + 1).padStart(3, '0')}`,
      name: n.name,
      city: n.city,
      admin: n.adminName,
      plan: n.plan,
      doctors: 0,
      admins: 1,
      patients: 0,
      mrr: n.plan === 'Inicial' ? 29 : n.plan === 'Clínica Pro' ? 79 : 199,
      created: '31/10/2026',
      status: 'En prueba',
    };
    setClinics((prev) => [next, ...prev]);
    setModal(false);
    setToast(`Clínica «${n.name}» creada. Se envió el acceso a ${n.adminEmail}`);
  };

  const SortHead = ({ k, label }: { k: typeof sortKey; label: string }) => (
    <button onClick={() => toggleSort(k)} className="inline-flex items-center gap-1 font-semibold uppercase tracking-wide transition-colors hover:text-foreground">
      {label}
      <Icon name={sortKey === k ? (sortDir === 'asc' ? 'ChevronUpIcon' : 'ChevronDownIcon') : 'ChevronUpDownIcon'} size={12} />
    </button>
  );

  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-base font-semibold">Clínicas de la plataforma</h2>
          <p className="text-xs text-muted-foreground">{filtered.length} resultados · administra planes, estado y personal activo</p>
        </div>
        <button
          onClick={() => setModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-95"
        >
          <Icon name="PlusIcon" size={16} />
          Crear clínica
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3">
        <div className="relative w-full sm:w-72">
          <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            aria-label="Buscar clínica"
            placeholder="Buscar por clínica, ciudad o administrador…"
            className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/20"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={`cf-${f}`}
              onClick={() => {
                setFilter(f);
                setPage(1);
              }}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all active:scale-95 ${
                filter === f ? 'border-primary bg-primary text-primary-foreground' : 'border-input hover:bg-muted'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="p-5">
          <EmptyState
            icon={<Icon name="BuildingOffice2Icon" size={24} />}
            title="No hay clínicas con esos filtros"
            description="Ajusta la búsqueda o el estado, o da de alta una nueva clínica para comenzar a gestionar su personal."
            actionLabel="Crear clínica"
            onAction={() => setModal(true)}
          />
        </div>
      ) : (
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="bg-muted/60 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5"><SortHead k="name" label="Clínica" /></th>
                <th className="px-4 py-2.5 font-semibold uppercase tracking-wide">Ciudad</th>
                <th className="px-4 py-2.5 font-semibold uppercase tracking-wide">Administrador</th>
                <th className="px-4 py-2.5 font-semibold uppercase tracking-wide">Plan</th>
                <th className="px-4 py-2.5 text-center font-semibold uppercase tracking-wide">Doctores</th>
                <th className="px-4 py-2.5 text-center font-semibold uppercase tracking-wide">Admin.</th>
                <th className="px-4 py-2.5 text-right"><SortHead k="patients" label="Pacientes" /></th>
                <th className="px-4 py-2.5 text-right"><SortHead k="mrr" label="MRR" /></th>
                <th className="px-4 py-2.5 font-semibold uppercase tracking-wide">Alta</th>
                <th className="px-4 py-2.5 font-semibold uppercase tracking-wide">Estado</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((c) => (
                <tr
                  key={c.id}
                  className={`group transition-all duration-300 hover:bg-muted/40 ${removing === c.id ? 'opacity-0' : 'opacity-100'}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                        {c.name.split(' ').slice(0, 2).map((p) => p[0]).join('')}
                      </span>
                      <span className="max-w-[180px] truncate font-semibold">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{c.city}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.admin}</td>
                  <td className="px-4 py-3"><Badge tone={c.plan === 'Red de clínicas' ? 'accent' : c.plan === 'Clínica Pro' ? 'info' : 'neutral'}>{c.plan}</Badge></td>
                  <td className="tabular px-4 py-3 text-center font-semibold">{c.doctors}</td>
                  <td className="tabular px-4 py-3 text-center font-semibold">{c.admins}</td>
                  <td className="tabular px-4 py-3 text-right font-semibold">{c.patients.toLocaleString('en-US')}</td>
                  <td className="tabular px-4 py-3 text-right">${c.mrr}</td>
                  <td className="tabular px-4 py-3 text-muted-foreground">{c.created}</td>
                  <td className="px-4 py-3">
                    <select
                      value={c.status}
                      onChange={(e) => changeStatus(c.id, e.target.value as ClinicStatus)}
                      aria-label={`Estado de ${c.name}`}
                      className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs font-semibold outline-none transition-colors ${
                        statusTone[c.status] === 'success' ?'border-success/30 bg-success/15 text-success'
                          : statusTone[c.status] === 'info' ?'border-primary/30 bg-primary/10 text-primary'
                          : statusTone[c.status] === 'danger' ?'border-destructive/30 bg-destructive/10 text-destructive' :'border-border bg-muted text-muted-foreground'
                      }`}
                    >
                      {(['Activa', 'En prueba', 'Pago vencido', 'Suspendida'] as ClinicStatus[]).map((s) => (
                        <option key={`${c.id}-${s}`} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="group/tt relative">
                        <button aria-label="Entrar como administrador" className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary">
                          <Icon name="ArrowRightEndOnRectangleIcon" size={16} />
                        </button>
                        <span role="tooltip" className="pointer-events-none absolute -top-8 right-0 z-10 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 shadow-lg transition-opacity group-hover/tt:opacity-100">Suplantar administrador</span>
                      </span>
                      <span className="group/tt relative">
                        <button onClick={() => remove(c.id, c.name)} aria-label="Eliminar clínica" className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
                          <Icon name="TrashIcon" size={16} />
                        </button>
                        <span role="tooltip" className="pointer-events-none absolute -top-8 right-0 z-10 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 shadow-lg transition-opacity group-hover/tt:opacity-100">Eliminar clínica — no se puede deshacer</span>
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>Filas por página</span>
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
            aria-label="Filas por página"
            className="rounded-md border border-input bg-card px-2 py-1 text-sm font-semibold text-foreground outline-none focus:border-primary"
          >
            {[6, 10, 20].map((n) => (
              <option key={`pp-${n}`} value={n}>{n}</option>
            ))}
          </select>
          <span className="tabular">· {filtered.length === 0 ? 0 : (current - 1) * perPage + 1}–{Math.min(current * perPage, filtered.length)} de {filtered.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(Math.max(1, current - 1))} disabled={current === 1} aria-label="Página anterior" className="rounded-md border border-input p-1.5 transition-all hover:bg-muted active:scale-95 disabled:cursor-not-allowed disabled:opacity-40">
            <Icon name="ChevronLeftIcon" size={16} />
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <button
              key={`page-${n}`}
              onClick={() => setPage(n)}
              className={`tabular h-8 w-8 rounded-md text-sm font-semibold transition-all active:scale-95 ${current === n ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              {n}
            </button>
          ))}
          <button onClick={() => setPage(Math.min(pages, current + 1))} disabled={current === pages} aria-label="Página siguiente" className="rounded-md border border-input p-1.5 transition-all hover:bg-muted active:scale-95 disabled:cursor-not-allowed disabled:opacity-40">
            <Icon name="ChevronRightIcon" size={16} />
          </button>
        </div>
      </div>

      <CreateClinicModal open={modal} onClose={() => setModal(false)} onCreate={create} />
      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </section>
  );
}