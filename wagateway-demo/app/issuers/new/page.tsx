'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewIssuerPage() {
  const router = useRouter();
  const [label, setLabel] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/issuers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: label.trim() }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? `Error ${res.status}`);
        setBusy(false);
        return;
      }
      router.push(`/issuers/${body.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setBusy(false);
    }
  }

  return (
    <main className="p-6 space-y-6 max-w-xl mx-auto">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <h1 className="text-base font-semibold tracking-wide">New issuer</h1>
        <Link
          href="/issuers"
          className="text-xs text-neutral-500 hover:text-white underline underline-offset-2"
        >
          ← issuers
        </Link>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
            Label
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. yantissimo-main"
            disabled={busy}
            className="w-full bg-transparent border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white/50"
            autoFocus
          />
          <p className="text-[11px] text-neutral-600 mt-2">
            A human-readable handle. The phone number will be filled automatically after pairing.
          </p>
        </div>

        {error && (
          <p className="text-xs text-amber-400 border border-amber-900 px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={busy || !label.trim()}
          className="text-xs px-4 py-2 border border-white/20 hover:border-white/50 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {busy ? 'Creating…' : 'Create + pair'}
        </button>
      </form>
    </main>
  );
}
