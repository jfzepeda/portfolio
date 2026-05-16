'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { IssuerRow } from '@/lib/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function IssuerDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [issuer, setIssuer] = useState<IssuerRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Cache-bust the QR <img> when status flips back to pending
  const [qrNonce, setQrNonce] = useState(() => Date.now());

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/issuers/${id}`, { cache: 'no-store' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? `Error ${res.status}`);
        return;
      }
      const data: IssuerRow = await res.json();
      setIssuer(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [id]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, [refresh]);

  // Bump QR cache key periodically while waiting so the <img> reloads
  useEffect(() => {
    if (issuer?.status === 'pending') {
      const t = setInterval(() => setQrNonce(Date.now()), 3000);
      return () => clearInterval(t);
    }
  }, [issuer?.status]);

  async function handleLogout() {
    if (!confirm('Logout this issuer? You will need to scan the QR again.')) return;
    setBusy(true);
    try {
      await fetch(`/api/issuers/${id}/logout`, { method: 'POST' });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this issuer? Only allowed if no projects are bound to it.')) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/issuers/${id}`, { method: 'DELETE' });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(body.error ?? `Error ${res.status}`);
        setBusy(false);
        return;
      }
      router.push('/issuers');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Unknown error');
      setBusy(false);
    }
  }

  return (
    <main className="p-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="text-base font-semibold tracking-wide">
            {issuer?.label ?? 'Issuer'}
          </h1>
          <p className="text-xs text-neutral-500 mt-1 font-mono">{id}</p>
        </div>
        <Link
          href="/issuers"
          className="text-xs text-neutral-500 hover:text-white underline underline-offset-2"
        >
          ← issuers
        </Link>
      </div>

      {error && (
        <p className="text-xs text-amber-400 border border-amber-900 px-3 py-2">{error}</p>
      )}

      {!issuer && !error && (
        <p className="text-xs text-neutral-500">Loading…</p>
      )}

      {issuer && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status" value={issuer.status.toUpperCase()} />
            <Field label="Phone" value={issuer.phone ?? '—'} mono />
            <Field
              label="Last connected"
              value={
                issuer.last_connected_at
                  ? new Date(issuer.last_connected_at).toLocaleString()
                  : '—'
              }
            />
            <Field label="Created" value={new Date(issuer.created_at).toLocaleString()} />
          </div>

          {issuer.status === 'connected' && (
            <div className="border border-green-900 text-green-400 px-4 py-3 text-xs">
              ✓ Connected as {issuer.phone}. HTTP requests can use this issuer via{' '}
              <code className="text-white">X-Issuer-Phone: {issuer.phone}</code> (optional —
              the project binding already resolves the issuer).
            </div>
          )}

          {issuer.status === 'pending' && (
            <div className="space-y-3">
              <p className="text-xs text-neutral-500">
                Scan this QR with WhatsApp → Settings → Linked Devices → Link a Device.
              </p>
              <div className="border border-white/10 bg-white p-4 inline-block">
                {issuer.has_qr ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/issuers/${id}/qr?t=${qrNonce}`}
                    alt="WhatsApp pairing QR"
                    width={256}
                    height={256}
                  />
                ) : (
                  <p className="text-xs text-neutral-500 w-64 h-64 flex items-center justify-center">
                    Waiting for QR…
                  </p>
                )}
              </div>
            </div>
          )}

          {issuer.status === 'disconnected' && (
            <p className="text-xs text-neutral-500">
              Disconnected. The server retries automatically; if pairing was lost,{' '}
              <button
                type="button"
                onClick={handleLogout}
                className="underline hover:text-white"
              >
                logout
              </button>{' '}
              and rescan.
            </p>
          )}

          <div className="flex gap-2 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={handleLogout}
              disabled={busy}
              className="text-xs px-3 py-1.5 border border-white/20 hover:border-white/50 disabled:opacity-40"
            >
              Logout / re-pair
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy}
              className="text-xs px-3 py-1.5 border border-red-900 text-red-400 hover:border-red-700 disabled:opacity-40"
            >
              Delete issuer
            </button>
          </div>
        </>
      )}
    </main>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="border border-white/10 px-3 py-2">
      <p className="text-[10px] uppercase tracking-widest text-neutral-500">{label}</p>
      <p className={`text-sm mt-1 ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}
