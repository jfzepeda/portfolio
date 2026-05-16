import Link from 'next/link';
import { api } from '@/lib/api';
import { SessionTable } from '@/components/SessionTable';

export const dynamic = 'force-dynamic';

export default async function SessionsList() {
  const { sessions } = await api.sessions().catch(() => ({ sessions: [] }));

  return (
    <main className="p-6 max-w-7xl mx-auto space-y-4">
      <div className="border-b border-white/10 pb-3 flex items-center justify-between">
        <h1 className="text-sm font-medium text-neutral-300">Sessions</h1>
        <Link
          href="/"
          className="text-xs text-neutral-500 hover:text-white underline underline-offset-2"
        >
          ← overview
        </Link>
      </div>

      <SessionTable sessions={sessions} />
    </main>
  );
}
