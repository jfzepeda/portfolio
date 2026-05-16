import type { SessionRow } from '@/lib/types';

export function StatsRow({
  sessions,
  unread,
}: {
  sessions: SessionRow[];
  unread: number;
}) {
  const totalMsgs = sessions.reduce(
    (s, ses) => s + ses.outbound_count + ses.inbound_count,
    0
  );

  const stats = [
    { label: 'Active sessions', value: sessions.length, color: 'text-white' },
    { label: 'Total messages', value: totalMsgs, color: 'text-white' },
    { label: 'Unread inbound', value: unread, color: 'text-amber-400' },
    {
      label: 'Conversational',
      value: sessions.filter((s) => s.inbound_count > 0).length,
      color: 'text-green-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="border border-white/10 bg-white/[0.02] p-4">
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-2">
            {stat.label}
          </p>
          <p className={`text-3xl font-light ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
