import { profile } from "@/data/profile";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="mt-12 py-12"
      style={{ borderTop: "1px solid var(--border)" }}
    >
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10 flex items-end justify-between gap-6 flex-wrap">
        <div>
          <div
            className="text-display text-[40px] lg:text-[56px]"
            style={{ color: "var(--fg)" }}
          >
            {profile.shortName}.
          </div>
          <p
            className="mt-2 text-[12px]"
            style={{ color: "var(--fg-subtle)" }}
          >
            © {year} {profile.name}. Built with Next.js, Tailwind, and intent.
          </p>
        </div>

        <nav
          aria-label="Footer"
          className="flex flex-wrap gap-x-6 gap-y-2 text-[13px]"
          style={{ color: "var(--fg-muted)" }}
        >
          <a
            href={`mailto:${profile.email}`}
            className="hover:text-[color:var(--fg)]"
          >
            Email
          </a>
          <a href="/llms.txt" className="hover:text-[color:var(--fg)]">
            llms.txt
          </a>
          <a href="/agents.md" className="hover:text-[color:var(--fg)]">
            agents.md
          </a>
          <a href="#top" className="hover:text-[color:var(--fg)]">
            Back to top
          </a>
        </nav>
      </div>
    </footer>
  );
}
