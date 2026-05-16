import Link from 'next/link';
import { api } from '@/lib/api';
import { IssuerRow } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function StatusBadge({ status }: { status: IssuerRow['status'] }) {
  const colors: Record<IssuerRow['status'], string> = {
    connected: 'text-green-400 border-green-900',
    pending: 'text-amber-400 border-amber-900',
    disconnected: 'text-neutral-500 border-neutral-800',
  };
  return (
    <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 border ${colors[status]}`}>
      {status}
    </span>
  );
}

export default async function IssuersPage() {
  const data = await api.issuers.list().catch(() => ({ issuers: [] as IssuerRow[] }));
  const issuers = data.issuers;

  return (
    <main className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="text-base font-semibold tracking-wide">Issuers</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Pair WhatsApp accounts. Each issuer is one phone number; projects bind to one issuer.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs text-neutral-500 hover:text-white underline underline-offset-2"
          >
            ← overview
          </Link>
          <Link
            href="/projects"
            className="text-xs text-neutral-500 hover:text-white underline underline-offset-2"
          >
            projects →
          </Link>
          <Link
            href="/issuers/new"
            className="text-xs px-3 py-1.5 border border-white/20 hover:border-white/50 hover:bg-white/5"
          >
            + add issuer
          </Link>
        </div>
      </div>

      <div className="border border-white/10">
        {issuers.length === 0 ? (
          <p className="px-4 py-8 text-xs text-neutral-600">
            No issuers yet.{' '}
            <Link href="/issuers/new" className="underline hover:text-white">
              Pair the first one
            </Link>
            .
          </p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                {['Label', 'Phone', 'Status', 'Last connected', ''].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-neutral-500 font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {issuers.map((iss) => (
                <tr key={iss.id} className="border-b border-white/10 hover:bg-white/[0.02]">
                  <td className="px-4 py-2.5">{iss.label}</td>
                  <td className="px-4 py-2.5 font-mono text-neutral-400">
                    {iss.phone ?? '—'}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={iss.status} />
                  </td>
                  <td className="px-4 py-2.5 text-neutral-500">
                    {iss.last_connected_at
                      ? new Date(iss.last_connected_at).toLocaleString()
                      : '—'}
                  </td>
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/issuers/${iss.id}`}
                      className="text-neutral-500 hover:text-white underline underline-offset-2"
                    >
                      manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
