"use client";

import { useMemo, useState } from "react";

export type CatalogProcedure = {
  id: string;
  name: string;
  price: number | string | null;
  active: boolean;
  specialty: string | null;
};

type Props = {
  items: CatalogProcedure[];
  search?: string;
  onEdit: (item: CatalogProcedure) => void;
  onToggleActive: (item: CatalogProcedure) => void;
  formatPrice?: (value: number | string | null) => string;
};

const NO_SPECIALTY = "Otros";

const norm = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/**
 * Catálogo de procedimientos agrupado en carpetas por especialidad.
 * Una carpeta abierta a la vez; al buscar se abren todas las que tengan coincidencias.
 */
export default function ProcedureCatalogAccordion({
  items,
  search = "",
  onEdit,
  onToggleActive,
  formatPrice = (v) => String(v ?? 0),
}: Props) {
  const [openFolder, setOpenFolder] = useState<string | null>(null);
  const q = norm(search.trim());

  const folders = useMemo(() => {
    const map = new Map<string, CatalogProcedure[]>();
    for (const it of items) {
      if (q && !norm(it.name).includes(q)) continue;
      const key = it.specialty?.trim() || NO_SPECIALTY;
      map.set(key, [...(map.get(key) ?? []), it]);
    }
    return [...map.entries()]
      .sort(([a], [b]) => (a === NO_SPECIALTY ? 1 : b === NO_SPECIALTY ? -1 : a.localeCompare(b, "es")))
      .map(([name, list]) => ({
        name,
        list: list.sort((a, b) => a.name.localeCompare(b.name, "es")),
      }));
  }, [items, q]);

  if (folders.length === 0) {
    return <p className="px-4 py-6 text-sm text-slate-500">No hay procedimientos que coincidan.</p>;
  }

  return (
    <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
      {folders.map(({ name, list }) => {
        const isOpen = q ? true : openFolder === name;
        const activeCount = list.filter((i) => i.active).length;
        return (
          <section key={name}>
            <button
              type="button"
              onClick={() => setOpenFolder(isOpen && !q ? null : name)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50"
            >
              <span className="flex items-center gap-2 font-medium text-slate-800">
                <span aria-hidden>{isOpen ? "📂" : "📁"}</span>
                {name}
              </span>
              <span className="text-xs text-slate-500">
                {list.length} procedimientos · {activeCount} activos {isOpen ? "▴" : "▾"}
              </span>
            </button>

            {isOpen && (
              <ul className="divide-y divide-slate-100 border-t border-slate-100 bg-slate-50/50">
                {list.map((it) => (
                  <li key={it.id} className="flex items-center justify-between gap-3 px-6 py-2.5">
                    <span className={it.active ? "text-slate-800" : "text-slate-500"}>{it.name}</span>
                    <span className="flex items-center gap-2">
                      <span className="text-sm tabular-nums text-slate-600">{formatPrice(it.price)}</span>
                      <button
                        type="button"
                        onClick={() => onEdit(it)}
                        className="rounded-lg border border-slate-300 px-3 py-1 text-xs hover:bg-white"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleActive(it)}
                        className="rounded-lg border border-slate-300 px-3 py-1 text-xs hover:bg-white"
                      >
                        {it.active ? "Desactivar" : "Activar"}
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
