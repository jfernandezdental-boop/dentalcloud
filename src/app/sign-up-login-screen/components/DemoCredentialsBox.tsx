'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

export interface DemoCredential {
  id: string;
  role: string;
  email: string;
  password: string;
}

interface DemoCredentialsBoxProps {
  credentials: DemoCredential[];
  onUse: (c: DemoCredential) => void;
}

export default function DemoCredentialsBox({ credentials, onUse }: DemoCredentialsBoxProps) {
  const [copied, setCopied] = useState('');

  const copy = (id: string, text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopied(id);
    setTimeout(() => setCopied(''), 1500);
  };

  return (
    <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-4">
      <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
        <Icon name="KeyIcon" size={14} />
        Cuentas demo por rol
      </p>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[360px] text-left text-xs">
          <thead>
            <tr className="text-muted-foreground">
              <th className="pb-1.5 font-semibold">Rol</th>
              <th className="pb-1.5 font-semibold">Correo</th>
              <th className="pb-1.5" />
            </tr>
          </thead>
          <tbody>
            {credentials.map((c) => (
              <tr key={c.id} className="border-t border-primary/15">
                <td className="py-2 pr-2 font-semibold">{c.role}</td>
                <td className="py-2 pr-2">
                  <span className="inline-flex items-center gap-1">
                    <span className="max-w-[150px] truncate">{c.email}</span>
                    <button onClick={() => copy(`${c.id}-e`, c.email)} aria-label="Copiar correo" className="text-muted-foreground hover:text-primary">
                      <Icon name={copied === `${c.id}-e` ? 'CheckIcon' : 'ClipboardIcon'} size={13} />
                    </button>
                  </span>
                </td>
                <td className="py-2 text-right">
                  <button
                    onClick={() => onUse(c)}
                    className="rounded-md bg-primary px-2.5 py-1 font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
                  >
                    Usar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">Pulsa «Usar» para autocompletar correo y contraseña.</p>
    </div>
  );
}