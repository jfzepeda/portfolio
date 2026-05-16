"use client";

import { useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Database,
  FileSpreadsheet,
  FileText,
  Loader2,
  Upload,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { classifyUpload, getUploadRouteLabel } from "@/lib/uploads/file-routing";
import { cn } from "@/lib/utils";

type UploadResponse = {
  vectorStore: null | {
    batchId: string;
    status: string;
    vectorStoreId: string;
    fileCounts: {
      completed: number;
      failed: number;
      total: number;
    };
  };
  structured: Array<{
    fileName: string;
    status: string;
    nextStep: string;
  }>;
  unsupported: Array<{
    fileName: string;
    status: string;
  }>;
  summary: {
    received: number;
    sentToVectorStore: number;
    sentToStructuredPipeline: number;
    unsupported: number;
  };
};

export function DocumentUploadBay() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const classifiedFiles = useMemo(
    () =>
      files.map((file) => ({
        file,
        route: classifyUpload(file),
      })),
    [files],
  );

  const vectorStoreCount = classifiedFiles.filter(
    (item) => item.route === "vector_store",
  ).length;
  const structuredCount = classifiedFiles.filter(
    (item) => item.route === "structured_pipeline",
  ).length;

  const appendFiles = (incoming: FileList | File[]) => {
    setResult(null);
    setError(null);
    setFiles((current) => {
      const byKey = new Map(
        current.map((file) => [`${file.name}-${file.size}`, file]),
      );

      for (const file of Array.from(incoming)) {
        byKey.set(`${file.name}-${file.size}`, file);
      }

      return Array.from(byKey.values());
    });
  };

  const removeFile = (fileToRemove: File) => {
    setFiles((current) => current.filter((file) => file !== fileToRemove));
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    setIsUploading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/uploads/documents", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "No se pudo procesar la carga.");
      }

      setResult(payload);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "No se pudo procesar la carga.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Bahia de carga</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-normal">
            Entrada documental
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm sm:flex">
          <div className="rounded-md border border-border bg-card px-3 py-2">
            <span className="text-muted-foreground">Vector</span>{" "}
            <span className="font-semibold">{vectorStoreCount}</span>
          </div>
          <div className="rounded-md border border-border bg-card px-3 py-2">
            <span className="text-muted-foreground">Tablas</span>{" "}
            <span className="font-semibold">{structuredCount}</span>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "rounded-lg border border-dashed border-border bg-card p-5 transition-colors",
          isDragging && "border-primary bg-primary/5",
        )}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          appendFiles(event.dataTransfer.files);
        }}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-md bg-secondary">
            <Upload className="size-6 text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium">Arrastra documentos o selecciona archivos</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Texto y documentos van a OpenAI Vector Store. CSV y Excel quedan
              apartados para el flujo estructurado.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => inputRef.current?.click()}
            >
              <FileText aria-hidden="true" />
              Seleccionar
            </Button>
            <Button
              type="button"
              onClick={uploadFiles}
              disabled={files.length === 0 || isUploading}
            >
              {isUploading ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <Database aria-hidden="true" />
              )}
              Enviar
            </Button>
          </div>
        </div>
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          multiple
          onChange={(event) => {
            if (event.target.files) {
              appendFiles(event.target.files);
            }
          }}
        />

        {classifiedFiles.length > 0 ? (
          <>
            <Separator className="my-5" />
            <div className="grid gap-2">
              {classifiedFiles.map(({ file, route }) => {
                const Icon =
                  route === "structured_pipeline" ? FileSpreadsheet : FileText;

                return (
                  <div
                    key={`${file.name}-${file.size}`}
                    className="flex min-h-12 items-center gap-3 rounded-md border border-border bg-background px-3 py-2"
                  >
                    <Icon
                      className={cn(
                        "size-4 shrink-0",
                        route === "structured_pipeline"
                          ? "text-amber-600"
                          : "text-primary",
                      )}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {getUploadRouteLabel(route)} ·{" "}
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeFile(file)}
                      title="Quitar"
                    >
                      <X aria-hidden="true" />
                      <span className="sr-only">Quitar</span>
                    </Button>
                  </div>
                );
              })}
            </div>
          </>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-950">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-medium">Carga procesada</p>
              <p className="mt-1 text-emerald-900/80">
                {result.summary.sentToVectorStore} archivo(s) al Vector Store,{" "}
                {result.summary.sentToStructuredPipeline} archivo(s) al flujo
                estructurado y {result.summary.unsupported} no soportado(s).
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
