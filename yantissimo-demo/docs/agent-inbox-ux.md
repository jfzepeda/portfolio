# CRM Inbox Conversacional — IA, Wireframes, UI y Flujos

Este documento resume la arquitectura de información, el mapa de navegación, los wireframes low‑fi, el sistema de diseño (tokens + componentes + estados) y el prototipo interactivo implementado en `src/app/(protected)/agent/page.jsx`.

## 1) IA + Mapa de Navegación

- Objetivo: “conversación + contexto + siguiente acción” con 3 columnas fijas.
- Estructura siempre visible:
  - Columna izquierda (~25%): Búsqueda global, filtros rápidos (chips) y lista(s) de chats.
  - Columna central (~50%): Hilo de conversación en burbujas + composer.
  - Columna derecha (~25%): Acciones y contexto (estado del agente, archivar, etapa, seguimiento).

Mapa (ASCII):

  [Búsqueda+Chips]
  [Lista de chats]
  └─ Chat item → Seleccionar → Carga hilo en centro → Acciones en derecha

  Centro (Hilo)
  ├─ Encabezado del contacto
  ├─ Burbujas con texto/imagen + timestamps
  └─ Composer (texto, adjuntos, enviar)

  Derecha (Contexto)
  ├─ Estado del agente (activar/pausar)
  ├─ Archivar/Desarchivar
  ├─ Etapa del lead
  └─ Seguimiento (presets)

Estados de navegación:
- Sin chat seleccionado: izquierda muestra 4 estados apilados (Nuevas, En curso, Calificado, Convertido); centro muestra empty‑state “Selecciona una conversación”; derecha muestra acciones deshabilitadas/placeholder.
- Con chat seleccionado: se mantiene el layout de 3 columnas; el hilo aparece cargado y el panel derecho queda activo.

## 2) Wireframes Low‑Fi

Sin chat seleccionado (3 columnas fijas):

| Izquierda (25%) | Centro (50%)                       | Derecha (25%)                      |
|-----------------|------------------------------------|-------------------------------------|
| Búsqueda + chips| [Empty‑state] Selecciona una conv. | Placeholder de Acciones deshabilit. |
| Nuevas (lista)  |                                    |                                     |
| En curso (lista)|                                    |                                     |
| Calificado      |                                    |                                     |
| Convertido      |                                    |                                     |

Con chat seleccionado:

| Izquierda (25%)             | Centro (50%)                                     | Derecha (25%)                   |
|-----------------------------|--------------------------------------------------|----------------------------------|
| Búsqueda + chips + lista    | Encabezado + Mensajes (burbujas) + Composer      | Estado agente + Acciones + Etapa |

## 3) UI High‑Fi — Sistema de Diseño

Tokens (CSS variables en `src/app/(protected)/agent/agent.css`):
- Colores:
  - `--bg`: #f5f5f7 (fondo neutro)
  - `--panel`: #ffffff (paneles)
  - `--panel-alt`: #e7ecef (panel suave)
  - `--text`: #11181c (texto principal)
  - `--muted`: #6b7280 (texto secundario)
  - `--border`: #e5e7eb (divisor/borde)
  - `--accent`: #0A84FF (acción primaria iOS‑like)
  - `--accent-10`: mezcla del acento con blanco (burbujas AI)
- Espaciado y radios:
  - `--radius`: 12px; `--space`: 12px

Componentes clave:
- Lista de chats: nombre/teléfono, preview último mensaje, hora, badge no leídos; ordenada por actividad reciente.
- Búsqueda y chips: estado del lead, archivadas/abiertas, atendido por AI/humano.
- Hilo central: burbujas diferenciando humano vs agente AI, soporte de texto + imágenes + timestamps.
- Composer: escribir, adjuntar, enviar. Enter envía (conversación abierta).
- Acciones rápidas: archivar/desarchivar, activar/pausar agente, cambiar etapa en 1 clic, registrar interacción, programar seguimiento.

Estados (hover/focus/disabled):
- Controles con foco visible (accesible), contraste AA/AAA.
- ListItemButton soporta teclado y lectura de `aria-selected`.
- Botones deshabilitan cuando no hay conversación seleccionada.

Accesibilidad:
- Roles ARIA en listas y botones; navegación por teclado; labels en inputs.

## 4) Prototipo Interactivo de Flujos

Implementado en `src/app/(protected)/agent/page.jsx` con WebSocket + fetches ya existentes.

Flujos optimizados:
- Crear lead <10s: la UI se centra en búsqueda + nuevo chat (extensible). La estructura y acciones son inmediatas.
- Registrar interacción en 1 clic: botón “Registrar interacción” en panel derecho (mock + `window.showToast`).
- Mover etapa en 1 clic: `Select` de etapa accesible en el panel derecho sin salir del hilo.
- Programar seguimiento: presets con 1 clic (mock de recordatorio + `window.showToast`).
- Buscar cliente y entender contexto <5s: búsqueda global con chips; lista ordenada por actividad reciente; timestamps discretos.

Notas de implementación y estilo:
- Se respetan patrones tipo WhatsApp sin copiar elementos protegidos: ritmo simple, jerarquía tipográfica clara, contexto rápido.
- Apple HIG adaptado a web: tipografía limpia, espaciados generosos, acento único, componentes consistentes, targets amplios.

Rutas y archivos:
- `src/app/(protected)/agent/page.jsx` — vista principal (3 columnas, conversación, acciones).
- `src/app/(protected)/agent/agent.css` — tokens + utilidades (grid 3 columnas, estados, empty‑state).

