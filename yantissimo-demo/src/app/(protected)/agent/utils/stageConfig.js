import { APP_COLOR_VARS } from "~/theme";

/**
 * CRM Pipeline Stage Configuration
 * Defines all stages, colors, transitions, and validation rules
 * for the commercial flow (Bot + Human).
 */

export const LEAD_STAGES = {
  nuevo: {
    key: "nuevo",
    label: "Nuevo",
    color: APP_COLOR_VARS.status.cold,
    idx: 0,
    actor: "BOT",
  },
  segmentado: {
    key: "segmentado",
    label: "Segmentado",
    color: APP_COLOR_VARS.status.scheduled,
    idx: 2,
    actor: "BOT",
  },
  cotizando: {
    key: "cotizando",
    label: "Cotizando",
    color: APP_COLOR_VARS.semantic.info,
    idx: 2,
    actor: "BOT+HUMAN",
  },
  convertido: {
    key: "convertido",
    label: "Coti Aprobada",
    color: APP_COLOR_VARS.semantic.warning,
    idx: 3,
    actor: "BOT+HUMAN",
  },
  agendado: {
    key: "agendado",
    label: "Agendado",
    color: APP_COLOR_VARS.status.active,
    idx: 4,
    actor: "HUMAN",
  },
};

// Stages shown as Kanban columns
export const KANBAN_STAGES = [
  "nuevo",
  "segmentado",
  "cotizando",
  "convertido",
  "agendado",
];

// Mutually exclusive transversal states used by viewState filter.
export const LEAD_STATES = {
  open: { key: "open", label: "Abiertos", color: APP_COLOR_VARS.semantic.info },
  follow_up: {
    key: "follow_up",
    label: "Seguimiento",
    color: APP_COLOR_VARS.status.scheduled,
  },
  closed: { key: "closed", label: "Cerrados", color: APP_COLOR_VARS.semantic.success },
  archived: { key: "archived", label: "Archivados", color: APP_COLOR_VARS.semantic.error },
};

// Backward compatibility with legacy backend stage keys.
const LEGACY_STAGE_MAP = {
  new: "nuevo",
  ongoing: "cotizando",
  qualified: "cotizando",
  converted: "convertido",
};

export const normalizeStageKey = (stage) => {
  if (!stage) return stage;
  return LEGACY_STAGE_MAP[stage] || stage;
};

const LEGACY_STATE_MAP = {
  seguimiento: "follow_up",
  followup: "follow_up",
  follow_up: "follow_up",
  closed: "closed",
  cerrado: "closed",
  archived: "archived",
  archivado: "archived",
  open: "open",
  abierto: "open",
};

export const normalizeStateKey = (state) => {
  if (!state) return null;
  return LEGACY_STATE_MAP[state] || state;
};

// Derives transversal state when backend still sends legacy stage/archived fields.
export const deriveConversationState = (conversation) => {
  if (conversation?.archived) return "archived";
  const normalizedState = normalizeStateKey(conversation?.state);
  if (normalizedState) return normalizedState;

  const stage = normalizeStageKey(conversation?.stage);
  if (stage === "cerrado") return "closed";
  if (stage === "seguimiento") return "follow_up";
  return "open";
};

// Follow-up temperature options
export const FOLLOWUP_TEMPERATURES = [
  { key: "frio", label: "Frío", color: APP_COLOR_VARS.semantic.info },
  { key: "tibio", label: "Tibio", color: APP_COLOR_VARS.semantic.warning },
  { key: "caliente", label: "Caliente", color: APP_COLOR_VARS.semantic.error },
];

// Valid stage transitions: from → [allowed targets]
export const STAGE_TRANSITIONS = {
  nuevo: ["segmentado"],
  segmentado: ["cotizando"],
  cotizando: ["convertido", "agendado"],
  convertido: ["agendado"],
  agendado: [],
};

/**
 * Validate if a stage transition is allowed.
 * Returns { valid, errors, requiresForm }
 *
 * @param {object} conversation - The conversation object
 * @param {string} targetStage  - The target stage key
 */
export function validateStageTransition(conversation, targetStage) {
  const currentStage = conversation.stage;
  const currentState = deriveConversationState(conversation);

  if (currentState !== "open") {
    return {
      valid: false,
      errors: ["Solo los leads abiertos permiten cambios de etapa"],
    };
  }

  // Check if the transition is in the allowed list
  const allowed = STAGE_TRANSITIONS[currentStage];
  if (!allowed || !allowed.includes(targetStage)) {
    const currentLabel = LEAD_STAGES[currentStage]?.label || currentStage;
    const targetLabel = LEAD_STAGES[targetStage]?.label || targetStage;
    return {
      valid: false,
      errors: [`No se puede mover de "${currentLabel}" a "${targetLabel}"`],
    };
  }

  return { valid: true, errors: [] };
}
