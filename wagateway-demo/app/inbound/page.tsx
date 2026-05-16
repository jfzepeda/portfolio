import Link from 'next/link';
import { api } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function InboundPage() {
  const { sessions } = await api.sessions().catch(() => ({ sessions: [] }));

  const unreadSessions = sessions
    .filter((s) => s.unread_count > 0)
    .sort((a, b) => b.unread_count - a.unread_count);

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-4">
      <div className="border-b border-white/10 pb-3 flex items-center justify-between">
        <h1 className="text-sm font-medium text-neutral-300">Unread inbound</h1>
        <Link
          href="/"
          className="text-xs text-neutral-500 hover:text-white underline underline-offset-2"
        >
          ← overview
        </Link>
      </div>

      {unreadSessions.length === 0 ? (
        <p className="text-xs text-neutral-600 py-4">
          All caught up — no unread inbound messages.
        </p>
      ) : (
        <div className="border border-white/10">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                {['Session', 'Phone', 'Unread', ''].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2 text-left text-neutral-500 font-normal"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {unreadSessions.map((s) => (
                <tr key={s.id} className="border-b border-white/10 hover:bg-white/[0.02]">
                  <td className="px-4 py-2.5 font-mono text-neutral-400">
                    {s.id.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-2.5">{s.phone}</td>
                  <td className="px-4 py-2.5 text-amber-400">{s.unread_count}</td>
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/sessions/${s.id}`}
                      className="text-neutral-500 hover:text-white underline underline-offset-2"
                    >
                      open thread
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
