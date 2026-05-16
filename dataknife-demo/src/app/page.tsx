import { Activity, FileSearch, ShieldCheck } from "lucide-react";

import { BusinessCarousel } from "@/components/home/business-carousel";
import { DocumentUploadBay } from "@/components/home/document-upload-bay";

const operatingSignals = [
  {
    label: "Ingestion",
    value: "Vector Store",
    icon: FileSearch,
  },
  {
    label: "Gobierno",
    value: "Rutas listas",
    icon: ShieldCheck,
  },
  {
    label: "Estado",
    value: "Plug and play",
    icon: Activity,
  },
];

export default function Home() {
  return (
    <div className="min-h-dvh overflow-y-auto">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-border pb-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              DataKnife Platform
            </p>
            <p className="mt-2 max-w-3xl text-base leading-7 text-muted-foreground">
              Punto de entrada para conocimiento interno, clasificacion de
              documentos y asistencia contextual para equipos de negocio.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 xl:min-w-[520px]">
            {operatingSignals.map((signal) => {
              const Icon = signal.icon;

              return (
                <div
                  key={signal.label}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-3"
                >
                  <div className="flex size-9 items-center justify-center rounded-md bg-secondary">
                    <Icon className="size-4 text-primary" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      {signal.label}
                    </p>
                    <p className="truncate text-sm font-medium">
                      {signal.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </header>

        <BusinessCarousel />
        <DocumentUploadBay />
      </div>
    </div>
  );
}
