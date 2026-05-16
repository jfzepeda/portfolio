'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { IssuerRow, ProjectRow } from '@/lib/types';

interface Props {
  projects: ProjectRow[];
  issuers: IssuerRow[];
}

export function ProjectRows({ projects, issuers }: Props) {
  return (
    <tbody>
      {projects.map((p) => (
        <ProjectRowItem key={p.id} project={p} issuers={issuers} />
      ))}
    </tbody>
  );
}

function ProjectRowItem({ project, issuers }: { project: ProjectRow; issuers: IssuerRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function onChange(issuerId: string) {
    if (!issuerId || issuerId === project.issuer_id) return;
    setError(null);
    try {
      const res = await fetch(
        `/api/projects/${encodeURIComponent(project.name)}/issuer`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ issuer_id: issuerId }),
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? `Error ${res.status}`);
        return;
      }
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  const statusColor =
    project.issuer_status === 'connected'
      ? 'text-green-400'
      : project.issuer_status === 'pending'
        ? 'text-amber-400'
        : project.issuer_status === 'disconnected'
          ? 'text-neutral-500'
          : 'text-red-400';

  return (
    <tr className="border-b border-white/10 hover:bg-white/[0.02]">
      <td className="px-4 py-2.5">{project.name}</td>
      <td className="px-4 py-2.5 text-neutral-500">
        {project.store_replies ? 'yes' : 'no'}
      </td>
      <td className="px-4 py-2.5 text-neutral-500 truncate max-w-[16rem]">
        {project.webhook_url ?? '—'}
      </td>
      <td className="px-4 py-2.5">
        <select
          value={project.issuer_id ?? ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={pending}
          className="bg-transparent border border-white/20 px-2 py-1 text-xs focus:outline-none focus:border-white/50 disabled:opacity-50"
        >
          {!project.issuer_id && <option value="">— select —</option>}
          {issuers.map((iss) => (
            <option key={iss.id} value={iss.id} className="bg-[#0a0a0a]">
              {iss.label}
              {iss.phone ? ` (${iss.phone})` : ' (not paired)'}
            </option>
          ))}
        </select>
        {error && <p className="text-[10px] text-amber-400 mt-1">{error}</p>}
      </td>
      <td className={`px-4 py-2.5 text-[10px] uppercase tracking-widest ${statusColor}`}>
        {project.issuer_status ?? 'unbound'}
      </td>
      <td className="px-4 py-2.5 text-neutral-600">
        {pending ? 'saving…' : ''}
      </td>
    </tr>
  );
}
