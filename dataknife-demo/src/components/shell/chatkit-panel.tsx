"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, CircleAlert, Loader2 } from "lucide-react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";

import { isSqlToolName, onSqlTool } from "@/lib/openai/sql-tool";

function getDeviceUserId() {
  const key = "dataknife-chatkit-user";
  const existing = window.localStorage.getItem(key);

  if (existing) {
    return existing;
  }

  const generated = `dataknife-${crypto.randomUUID()}`;
  window.localStorage.setItem(key, generated);
  return generated;
}

export function ChatKitPanel() {
  const [error, setError] = useState<string | null>(null);
  const [initialClientSecret, setInitialClientSecret] = useState<string | null>(
    null,
  );
  const [isPreparing, setIsPreparing] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function prepareSession() {
      try {
        const clientSecret = await requestChatKitClientSecret();

        if (isActive) {
          setInitialClientSecret(clientSecret);
          setError(null);
        }
      } catch (sessionError) {
        if (isActive) {
          setError(
            sessionError instanceof Error
              ? sessionError.message
              : "No se pudo iniciar ChatKit.",
          );
        }
      } finally {
        if (isActive) {
          setIsPreparing(false);
        }
      }
    }

    prepareSession();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <aside className="hidden w-[390px] shrink-0 border-l border-border bg-panel lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-border px-5">
        <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Bot className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold">ChatKit OpenAI</p>
          <p className="truncate text-xs text-muted-foreground">
            Panel lateral conectado al workflow
          </p>
        </div>
      </div>
      {error ? (
        <div className="m-4 flex gap-3 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning-foreground">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>{error}</p>
        </div>
      ) : null}
      <div className="min-h-0 flex-1 p-3">
        {isPreparing ? (
          <div className="flex h-full min-h-[680px] items-center justify-center rounded-lg border border-dashed border-border bg-background text-sm text-muted-foreground">
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
            Preparando ChatKit
          </div>
        ) : error || !initialClientSecret ? (
          <div className="flex h-full min-h-[680px] items-center justify-center rounded-lg border border-dashed border-border bg-background px-8 text-center text-sm leading-6 text-muted-foreground">
            Configura las variables de OpenAI para activar la conversacion.
          </div>
        ) : (
          <ChatKitRuntime initialClientSecret={initialClientSecret} />
        )}
      </div>
    </aside>
  );
}

async function requestChatKitClientSecret() {
  const response = await fetch("/api/chatkit/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user: getDeviceUserId(),
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof payload.message === "string"
        ? payload.message
        : "No se pudo iniciar ChatKit.",
    );
  }

  return payload.client_secret as string;
}

function ChatKitRuntime({
  initialClientSecret,
}: {
  initialClientSecret: string;
}) {
  const initialSecretConsumed = useRef(false);

  const controlOptions = useMemo(
    () => ({
      api: {
        async getClientSecret() {
          if (!initialSecretConsumed.current) {
            initialSecretConsumed.current = true;
            return initialClientSecret;
          }

          return requestChatKitClientSecret();
        },
      },
      async onClientTool(toolCall: {
        name: string;
        params: Record<string, unknown>;
      }) {
        if (isSqlToolName(toolCall.name)) {
          return onSqlTool(toolCall);
        }

        return {
          ok: false,
          error: `Tool local no implementada: ${toolCall.name}`,
        };
      },
      composer: {
        placeholder: "Pregunta sobre la operacion...",
      },
      header: {
        title: {
          enabled: true,
          text: "Asistente",
        },
      },
      startScreen: {
        greeting: "Listo para consultar la base de conocimiento.",
        prompts: [
          {
            label: "Documentos cargados",
            prompt: "Resume los documentos disponibles en el vector store.",
          },
          {
            label: "Operaciones",
            prompt: "Ayudame a revisar riesgos operativos recientes.",
          },
        ],
      },
      theme: {
        colorScheme: "light" as const,
        radius: "soft" as const,
        density: "compact" as const,
      },
    }),
    [initialClientSecret],
  );

  const { control } = useChatKit(controlOptions);

  return <ChatKit control={control} className="h-full min-h-[680px] w-full" />;
}
