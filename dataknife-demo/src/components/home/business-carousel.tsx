"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeDollarSign,
  BriefcaseBusiness,
  Factory,
  Landmark,
  LineChart,
  Truck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const businessAreas = [
  {
    name: "Administracion",
    description: "Gobierno interno, politicas, contratos y soporte ejecutivo.",
    metric: "42 expedientes",
    signal: "Control documental",
    icon: Landmark,
    accent: "bg-sky-500",
  },
  {
    name: "Operaciones",
    description: "Procedimientos, bitacoras, incidencias y continuidad diaria.",
    metric: "18 flujos activos",
    signal: "Ejecucion",
    icon: Factory,
    accent: "bg-emerald-500",
  },
  {
    name: "Ventas",
    description: "Propuestas, playbooks, pipeline comercial y seguimiento.",
    metric: "31 oportunidades",
    signal: "Ingreso",
    icon: BadgeDollarSign,
    accent: "bg-amber-500",
  },
  {
    name: "Finanzas",
    description: "Reportes, conciliaciones, presupuestos y cierre mensual.",
    metric: "9 tableros",
    signal: "Precision",
    icon: LineChart,
    accent: "bg-indigo-500",
  },
  {
    name: "Logistica",
    description: "Rutas, inventario, entregas, proveedores y SLA.",
    metric: "24 rutas",
    signal: "Movimiento",
    icon: Truck,
    accent: "bg-rose-500",
  },
  {
    name: "Direccion",
    description: "Prioridades, decisiones, minutas y vision de negocio.",
    metric: "7 iniciativas",
    signal: "Estrategia",
    icon: BriefcaseBusiness,
    accent: "bg-cyan-600",
  },
];

export function BusinessCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeArea = businessAreas[activeIndex];

  const visibleAreas = useMemo(() => {
    return [0, 1, 2].map(
      (offset) => businessAreas[(activeIndex + offset) % businessAreas.length],
    );
  }, [activeIndex]);

  const move = (direction: "previous" | "next") => {
    setActiveIndex((current) => {
      if (direction === "previous") {
        return current === 0 ? businessAreas.length - 1 : current - 1;
      }

      return (current + 1) % businessAreas.length;
    });
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Areas de negocio</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-foreground">
            Centro de conocimiento empresarial
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => move("previous")}
            title="Anterior"
          >
            <ArrowLeft aria-hidden="true" />
            <span className="sr-only">Anterior</span>
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => move("next")}
            title="Siguiente"
          >
            <ArrowRight aria-hidden="true" />
            <span className="sr-only">Siguiente</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr_0.8fr]">
        {visibleAreas.map((area, index) => {
          const Icon = area.icon;
          const isActive = area.name === activeArea.name;

          return (
            <Card
              key={area.name}
              className={cn(
                "min-h-[230px] overflow-hidden",
                isActive ? "border-primary/35 bg-card" : "bg-muted/35",
              )}
            >
              <CardHeader>
                <div className="mb-5 flex items-center justify-between">
                  <div
                    className={cn(
                      "flex size-11 items-center justify-center rounded-md text-white",
                      area.accent,
                    )}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <span className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
                    {area.signal}
                  </span>
                </div>
                <CardTitle className={isActive ? "text-xl" : "text-base"}>
                  {area.name}
                </CardTitle>
                <CardDescription>{area.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-1 text-sm">
                  <span className="text-muted-foreground">Cobertura</span>
                  <span className="font-medium">{area.metric}</span>
                </div>
                <Progress value={index === 0 ? 78 : index === 1 ? 56 : 44} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
