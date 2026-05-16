import Link from 'next/link';
import { api } from '@/lib/api';
import type { IssuerRow, ProjectRow } from '@/lib/types';
import { ProjectRows } from './ProjectRows';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProjectsPage() {
  const [projectsRes, issuersRes] = await Promise.all([
    api.projects.list().catch(() => ({ projects: [] as ProjectRow[] })),
    api.issuers.list().catch(() => ({ issuers: [] as IssuerRow[] })),
  ]);

  const projects = projectsRes.projects;
  const issuers = issuersRes.issuers;

  return (
    <main className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="text-base font-semibold tracking-wide">Projects</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Each project is bound to one issuer. Change the binding here.
          </p>
        </div>
        <Link
          href="/"
          className="text-xs text-neutral-500 hover:text-white underline underline-offset-2"
        >
          ← overview
        </Link>
      </div>

      <div className="border border-white/10">
        {projects.length === 0 ? (
          <p className="px-4 py-8 text-xs text-neutral-600">
            No projects registered. Use{' '}
            <code className="text-neutral-400">pnpm register</code> in the server.
          </p>
        ) : issuers.length === 0 ? (
          <p className="px-4 py-8 text-xs text-amber-400">
            No issuers paired yet.{' '}
            <Link href="/issuers/new" className="underline hover:text-white">
              Pair one first
            </Link>{' '}
            before binding projects.
          </p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                {['Project', 'Replies', 'Webhook', 'Issuer', 'Status', ''].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2 text-left text-neutral-500 font-normal"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <ProjectRows projects={projects} issuers={issuers} />
          </table>
        )}
      </div>
    </main>
  );
}
