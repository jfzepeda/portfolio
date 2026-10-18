"use client";

import { useState } from "react";
import { Bot } from "lucide-react";

const examples = [
  { question: "¿Qué documentos puedo consultar?", answer: "La base de ejemplo contiene una política de compras, un procedimiento de incidentes y un playbook comercial. Selecciona Operaciones o Ventas para explorar una respuesta con su fuente.", source: "Índice documental de ejemplo" },
  { question: "¿Cómo reporto un incidente de operaciones?", answer: "Registra el servicio afectado, la hora y el impacto. Asigna una persona responsable y prioriza los incidentes que interrumpen la operación. Al cerrar, documenta la causa y la acción preventiva.", source: "Procedimiento de incidentes · sección 2 (documento ficticio)" },
  { question: "¿Qué debe incluir una propuesta de ventas?", answer: "Incluye el problema del cliente, alcance, entregables, calendario y condiciones comerciales. Antes de enviarla, valida los supuestos con el responsable de la oportunidad.", source: "Playbook comercial · sección 3 (documento ficticio)" },
];

export function ChatKitPanel() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{ question: string; answer: string; source: string }[]>([]);

  function ask(value: string) {
    if (!value.trim()) return;
    const example = /incidente|operaci/i.test(value) ? examples[1]
      : /venta|propuesta|comercial/i.test(value) ? examples[2] : examples[0];
    setMessages((current) => [...current, { ...example, question: value }]);
    setQuestion("");
  }

  return (
    <aside className="w-full shrink-0 border-l border-border bg-panel lg:w-[390px]" aria-label="Asistente de demostración">
      <div className="flex items-center gap-3 border-b border-border p-5">
        <Bot className="size-5" aria-hidden="true" />
        <div><p className="font-semibold">Asistente DataKnife</p><p className="text-xs text-muted-foreground">Demo interactiva · respuestas de ejemplo</p></div>
      </div>
      <div className="space-y-4 p-4">
        <p className="text-sm text-muted-foreground">Explora documentos ficticios. Las respuestas están preparadas para esta demo; no se consulta una IA ni los archivos que cargues.</p>
        {examples.map((example) => <button key={example.question} onClick={() => ask(example.question)} className="block w-full rounded-lg border border-border p-3 text-left text-sm hover:bg-muted">{example.question}</button>)}
        <div aria-live="polite" className="max-h-[440px] space-y-4 overflow-y-auto">
          {messages.map((message, index) => <div key={index} className="space-y-2 rounded-lg border border-border p-3 text-sm"><p className="font-semibold">{message.question}</p><p>{message.answer}</p><p className="text-xs text-muted-foreground">Fuente: {message.source}</p></div>)}
        </div>
        <form onSubmit={(event) => { event.preventDefault(); ask(question); }} className="flex gap-2">
          <input aria-label="Pregunta sobre los documentos de ejemplo" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Pregunta sobre operaciones o ventas" className="min-w-0 flex-1 rounded border border-border bg-background p-2 text-sm" />
          <button disabled={!question.trim()} className="rounded bg-primary px-3 text-sm text-primary-foreground disabled:opacity-50">Enviar</button>
        </form>
      </div>
    </aside>
  );
}
