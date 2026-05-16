import Link from 'next/link';
import { api } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function SessionThread({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { messages } = await api.sessionMessages(id);

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-4">
      <div className="border-b border-white/10 pb-3 flex items-center justify-between">
        <h1 className="text-sm font-medium text-neutral-300">
          Session{' '}
          <span className="font-mono text-neutral-500">{id}</span>
        </h1>
        <Link
          href="/"
          className="text-xs text-neutral-500 hover:text-white underline underline-offset-2"
        >
          ← back
        </Link>
      </div>

      <div className="space-y-0.5">
        {messages.length === 0 ? (
          <p className="text-xs text-neutral-600 py-4">No messages in this session yet.</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="flex gap-3 py-2.5 border-b border-white/[0.06]"
            >
              <div className="mt-1 flex-shrink-0">
                <span
                  className={`w-1.5 h-1.5 rounded-full block ${
                    msg.direction === 'outbound' ? 'bg-blue-400' : 'bg-green-400'
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-neutral-600 mb-0.5">
                  {msg.direction} · {new Date(msg.created_at).toLocaleTimeString()}
                </p>
                <p className="text-sm text-neutral-200 whitespace-pre-wrap break-words">
                  {msg.payload?.text ?? '[media]'}
                </p>
              </div>
              {!msg.retrieved && msg.direction === 'inbound' && (
                <span className="text-[10px] text-amber-400 self-start mt-1 flex-shrink-0">
                  unread
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
}
