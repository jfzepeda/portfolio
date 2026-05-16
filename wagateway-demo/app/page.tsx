import Link from 'next/link';
import { api } from '@/lib/api';
import { StatsRow } from '@/components/StatsRow';
import { SessionTable } from '@/components/SessionTable';

export const dynamic = 'force-dynamic';
export const revalidate = 30;

export default async function Overview() {
  const [health, sessionsRes] = await Promise.all([
    api.health().catch(() => null),
    api.sessions().catch(() => ({ sessions: [] })),
  ]);

  const sessions = sessionsRes.sessions;
  const totalUnread = sessions.reduce((s, ses) => s + ses.unread_count, 0);
  const connectedIssuers = health?.issuers_connected ?? 0;
  const totalIssuers = health?.issuers_total ?? 0;
  const allOk = totalIssuers > 0 && connectedIssuers === totalIssuers;
  const indicatorColor = allOk
    ? 'text-green-400 border-green-900'
    : connectedIssuers === 0
      ? 'text-amber-400 border-amber-900'
      : 'text-yellow-400 border-yellow-900';

  return (
    <main className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="text-base font-semibold tracking-wide">WA Gateway</h1>
          <p className="text-xs text-neutral-500 mt-1">
            DB: {health?.db ?? 'unknown'} · Issuers: {connectedIssuers}/{totalIssuers} ·
            Uptime: {health ? `${Math.floor(health.uptime / 60)}m` : '—'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/projects"
            className="text-xs text-neutral-500 hover:text-white underline underline-offset-2"
          >
            projects →
          </Link>
          <Link
            href="/issuers"
            className="text-xs text-neutral-500 hover:text-white underline underline-offset-2"
          >
            issuers →
          </Link>
          <div className={`flex items-center gap-2 text-xs px-3 py-1 border ${indicatorColor}`}>
            <span
              className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                allOk
                  ? 'bg-green-400'
                  : connectedIssuers === 0
                    ? 'bg-amber-400'
                    : 'bg-yellow-400'
              }`}
            />
            {connectedIssuers}/{totalIssuers} CONNECTED
          </div>
        </div>
      </div>

      {totalIssuers === 0 && (
        <div className="border border-amber-900 text-amber-400 px-4 py-3 text-xs">
          No issuers paired.{' '}
          <Link href="/issuers/new" className="underline hover:text-white">
            Pair the first one
          </Link>{' '}
          to start sending.
        </div>
      )}

      <StatsRow sessions={sessions} unread={totalUnread} />
      <SessionTable sessions={sessions} />
    </main>
  );
}
