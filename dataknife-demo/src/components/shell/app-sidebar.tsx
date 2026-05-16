import Link from "next/link";
import { Home, PanelsTopLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AppSidebar() {
  return (
    <aside className="flex w-16 shrink-0 flex-col items-center border-r border-border bg-background px-3 py-4">
      <div className="mb-6 flex size-10 items-center justify-center rounded-md border border-border bg-card">
        <PanelsTopLeft className="size-5 text-primary" aria-hidden="true" />
      </div>
      <nav aria-label="Navegacion principal" className="flex flex-1 flex-col">
        <Button asChild size="icon" variant="secondary" title="Inicio">
          <Link href="/">
            <Home className="size-4" aria-hidden="true" />
            <span className="sr-only">Inicio</span>
          </Link>
        </Button>
      </nav>
    </aside>
  );
}
