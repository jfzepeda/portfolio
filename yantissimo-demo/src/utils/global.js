// export const ROLES = {
//   CLIENT: 3,
//   CLIENT_ADMIN: 4,
//   TECHNICIAN: 5,
//   MYR_SELLER: 6,
//   SELLER: 7,
//   MANAGER: 8,
//   MARKETING: 9,
//   ADMIN: 10,
// };

export const ROLES = {
  OWNER: 100,
  ADMIN: 30,
  MARKETING: 26,
  MANAGER: 22,
  SELLER: 18,
  MYR_MANAGER: 15,
  MYR_SELLER: 13,
  MYR_HELPER: 11,
  TECHNICIAN: 8,
  CLIENT_ADMIN: 4,
  CLIENT: 3,
  CLIEN_L: 2,
};

export const ROLE_LABELS = {
  [ROLES.OWNER]: "Propietario",
  [ROLES.ADMIN]: "Administrador",
  [ROLES.MARKETING]: "Marketing",
  [ROLES.MANAGER]: "Gerente",
  [ROLES.SELLER]: "Vendedor",
  [ROLES.MYR_MANAGER]: "Gerente Myr",
  [ROLES.MYR_SELLER]: "Mayoreo",
  [ROLES.MYR_HELPER]: "Soporte Myr",
  [ROLES.TECHNICIAN]: "Tecnico",
  [ROLES.CLIENT_ADMIN]: "Admin Dist",
  [ROLES.CLIENT]: "Distribuidor",
  [ROLES.CLIEN_L]: "Cliente",
};

export const SUCS = ["MAN", "TEC", "BJZ", "CON", "NHS", "REY", "YAOL", "ADMIN"];
export const SUCS_MYR = ["MYRMZO", "MYRCOL"];
export const MYR_DIST_TYPES = [
  "DISTR MIXTO",
  "DISTR AYC",
  "DISTR CAMION",
  "FLOTILLA",
  "CAMION",
  "GENERAL",
];

export const BRANCH_LABELS = {
  cedis: "CDS",
  bj: "BJZ",
  cons: "CON",
  nh: "NHS",
  llntr: "LLR",
  tersa: "TRS",
  morales: "MOR",
  blvd: "BLV",
  colinas: "REY",
  llantrac: "LLR",
  benitoJuarez: "BJZ",
  moralesMzo: "MMZ",
  mzo: "MZO",
  tec: "TEC",
  cds: "CDS",
  bjz: "BJZ",
  con: "CON",
  nhs: "NHS",
  llr: "LLR",
  trs: "TRS",
  mor: "MOR",
  rey: "REY",
  blv: "BLV",
  mmz: "MMZ",
  dlg: "DLG",
};

const rampDictionary = {
  MAN: [
    "2Postes A",
    "2Postes B",
    "2Postes C",
    "Tijera A",
    "Tijera B",
    "Tijera C",
    "Alineadora A",
  ],
  TEC: [
    "2Postes A",
    "2Postes B",
    "2Postes C",
    "2Postes D",
    "Tijera A",
    "Tijera B",
    "Alineadora A",
  ],
  BJZ: ["2Postes A", "2Postes B", "2Postes C", "Alineadora A"],
  CON: [
    "2Postes A",
    "2Postes B",
    "2Postes C",
    "Tijera A",
    "Tijera B",
    "Alineadora A",
  ],
  NHS: ["2Postes A", "2Postes B", "Tijera A", "Alineadora A"],
  REY: ["2Postes A", "2Postes B", "2Postes C", "Tijera A", "Alineadora A"],
  YAOL: ["Rampa virtual"],
  MYR: ["Rampa virtual"],
  ADMIN: ["Rampa virtual"],
};

export const getRamps = (sucursal) => rampDictionary[sucursal];

const sucDictionary = {
  NHS: ["NIÑOS HÉROES", "Av Niños Héroes Esquina, Ignacio Torres #1050"],
  TEC: ["TECNOLÓGICO", "Av Tecnológico #7, La Frontera"],
  BJZ: ["BENITO JUÁREZ", "Av. Benito Juárez #365, La Gloria"],
  CON: ["CONSTITUCIÓN", "Av. Constitución #1837, Parque Royal"],
  REY: ["COLINAS", "Av. Enrique Corona Morfin #422"],
  MAN: ["MANZANILLO", "Boulevard Miguel de la Madrid #11386"],
  YAOL: ["TOMORROWLAND", "En la cima del mundo"],
  MYR: ["MAYORISTAS", "Bodegas de Mayoreo Yantissimo"],
  ADMIN: ["CORPORATIVO", "Cima empresarial"],
  MYRMZO: ["MYR MANZANILLO", "Bodegas de Yantissimo Manzanillo"],
  MYRCOL: ["MYR COLIMA", "Bodegas de Yantissimo Colima"],
};

export const doctypeOptions = {
  duplicate: { text: "Fragmentada", color: APP_COLOR_VARS.status.cold, idx: 0 },
  postcheck: { text: "Post-check", color: APP_COLOR_VARS.status.cold, idx: 0 },
  prequote: { text: "Pre-coti", color: APP_COLOR_VARS.status.cold, idx: 0 },
  quote: { text: "Cotización", color: APP_COLOR_VARS.semantic.info, idx: 1 },
  followup: {
    text: "Seguimiento",
    color: APP_COLOR_VARS.semantic.warning,
    idx: 2,
  },
  scheduled: {
    text: "Programada (Hoy)",
    color: APP_COLOR_VARS.status.scheduled,
    idx: 3,
  },
  appointed: {
    text: "Agendada (Después)",
    color: APP_COLOR_VARS.status.scheduled,
    idx: 3,
  },
  ongoing: { text: "En Patio", color: APP_COLOR_VARS.status.progress, idx: 4 },
  completed: {
    text: "Servicio Completado",
    color: APP_COLOR_VARS.semantic.success,
    idx: 5,
  },
  invoiced: {
    text: "Facturado",
    color: APP_COLOR_VARS.semantic.success,
    idx: 6,
  },
  archived: {
    text: "Archivada",
    color: APP_COLOR_VARS.status.archived,
    idx: 7,
  },
  canceled: { text: "Cancelada", color: APP_COLOR_VARS.semantic.error, idx: 8 },
};

export const digitalDT = [
  "duplicate",
  "postcheck",
  "prequote",
  "quote",
  "followup",
];
export const physicalDT = ["scheduled", "appointed", "ongoing", "completed"];
export const closedDT = ["invoiced", "archived", "canceled"];

export const doctypeOptionsMyr = {
  cartdraft: { text: "Carrito", color: APP_COLOR_VARS.status.cold, idx: 0 },
  preorder: { text: "Pre-orden", color: APP_COLOR_VARS.status.cold, idx: 0 },
  sentorder: {
    text: "Solicitado",
    color: APP_COLOR_VARS.semantic.info,
    idx: 1,
  },
  counteroffer: {
    text: "Revision",
    color: APP_COLOR_VARS.status.scheduled,
    idx: 2,
  },
  confirmed: {
    text: "Confirmada",
    color: APP_COLOR_VARS.status.active,
    idx: 3,
  },
  "part-invoiced": {
    text: "Facturada parcial",
    color: APP_COLOR_VARS.semantic.warning,
    idx: 4,
  },
  invoiced: {
    text: "Facturado",
    color: APP_COLOR_VARS.semantic.success,
    idx: 4,
  },
  ondelivery: {
    text: "En camino",
    color: APP_COLOR_VARS.status.active,
    idx: 5,
  },
  delivered: { text: "Entregada", color: APP_COLOR_VARS.status.active, idx: 6 },
  archived: {
    text: "Archivada",
    color: APP_COLOR_VARS.status.archived,
    idx: 7,
  },
  canceled: { text: "Cancelada", color: APP_COLOR_VARS.semantic.error, idx: 8 },
};

export const digitalDTMyr = ["cartdraft", "preorder"];
export const physicalDTMyr = ["sentorder", "counteroffer", "confirmed"];
export const closedDTMyr = [
  "part-invoiced",
  "invoiced",
  "ondelivery",
  "delivered",
];

export const getSuc = (sucursal) => {
  const result = sucDictionary[sucursal];
  return result ?? ["YANTISSIMO", "Bodegas Yantissimo"];
};

export const debugLog = (...args) => {
  if (process.env.NEXT_PUBLIC_NODE_ENV === "local") {
    console.debug(...args);
  }
};

export const PAYMENT_METHODS = [
  { value: "efectivo", label: "Efectivo" },
  { value: "spei", label: "SPEI" },
  { value: "afirme", label: "Afirme" },
  { value: "bbva", label: "BBVA" },
  { value: "santander", label: "Santander" },
  { value: "mercado_pago", label: "Mercado Pago" },
  { value: "por_definir", label: "Por definir" },
];

// ------------------- Marcas -------------------
export const marcasConocidas = [
  "MICHELIN",
  "BRIDGESTONE",
  "CONTINENTAL",
  "PIRELLI",
  "GOODYEAR",
  "FIRESTONE",
  "DUNLOP",
  "BFGOODRICH",
  "HANKOOK",
  "TOYO",
  "YOKOHAMA",
  "KUMHO",
  "FALKEN",
  "NITTO",
  "GENERAL",
  "UNIROYAL",
  "MAXXIS",
  "SUMITOMO",
  "COOPER",
  "APOLLO",
  "VREDESTEIN",
  "BARUM",
  "WESTLAKE",
  "SAILUN",
  "NEXEN",
  "LAUFENN",
  "KENDA",
  "ARMSTRONG",
  "ZEETEX",
  "GOODRIDE",
  "OVATION",
  "SUMMAX",
  "DEXTERO",
  "AMERICUS",
  "MAZZINI",
  "FULLRUN",
  "ROADCLAW",
  "TRACMAX",
  "WANLI",
  "GALLANT",
  "ROADSHINE",
  "ARDENT",
  "BLACKHAWK",
  "SURETRAC",
  "TAITONG",
  "DOVROAD",
  "NOVAMAXX",
  "MINNELL",
  "SAFERICH",
  "AOQISHI",
  "RACEALONE",
  "FORCELAND",
  "SUNWIDE",
  "ANTARES",
  "BLACKLION",
  "STARFIRE",
  "DERUIBO",
  "TURNPIKE",
  "STONETRAC",
  "AMULET",
  "LANDY",
  "JOYROAD",
  "ARDUZZA",
  "FRONWAY",
  "AULICE",
  "ATLAS",
  "KELLY",
  "AGATE",
  "KAPSEN",
  "GRANDSTONE",
  "ZMAX",
  "WINRUN",
  "DOUBLESTAR",
  "ILINK",
  "MILEVER",
  "MIRAGE",
  "TORNEL",
  "EUZKADI",
  "MAXTREK",
  "ECOVISION",
  "DSTAR",
  "TEST FAKE",
  "BLACKHAWAK",
  "AMSTRONG",
];
import { APP_COLOR_VARS } from "~/theme";
