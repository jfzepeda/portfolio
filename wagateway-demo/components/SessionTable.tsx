import Link from 'next/link';
import type { SessionRow } from '@/lib/types';

export function SessionTable({ sessions }: { sessions: SessionRow[] }) {
  return (
    <div className="border border-white/10">
      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-[10px] uppercase tracking-widest text-neutral-500">
          Active sessions
        </p>
      </div>
      {sessions.length === 0 ? (
        <p className="px-4 py-8 text-xs text-neutral-600">No active sessions yet.</p>
      ) : (
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10">
              {['Session ID', 'Phone', 'Issuer', 'Out', 'In', 'Unread', ''].map((h) => (
                <th key={h} className="px-4 py-2 text-left text-neutral-500 font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id} className="border-b border-white/10 hover:bg-white/[0.02]">
                <td className="px-4 py-2.5 font-mono text-neutral-400">
                  {s.id.slice(0, 8)}…
                </td>
                <td className="px-4 py-2.5">{s.phone}</td>
                <td className="px-4 py-2.5 font-mono text-neutral-500">
                  {s.issuer_phone ?? s.issuer_label ?? '—'}
                </td>
                <td className="px-4 py-2.5">{s.outbound_count}</td>
                <td className="px-4 py-2.5">{s.inbound_count}</td>
                <td className="px-4 py-2.5">
                  {s.unread_count > 0 ? (
                    <span className="text-amber-400">{s.unread_count}</span>
                  ) : (
                    <span className="text-neutral-600">—</span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <Link
                    href={`/sessions/${s.id}`}
                    className="text-neutral-500 hover:text-white underline underline-offset-2"
                  >
                    view
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
