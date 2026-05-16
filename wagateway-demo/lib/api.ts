/**
 * Demo branch — no real gateway. Every call returns canned fixtures
 * shaped like the production HTTP responses. No env vars required.
 */
import type {
  HealthResponse,
  IssuerRow,
  MessageRow,
  ProjectRow,
  SessionRow,
} from './types';

const NOW = () => new Date().toISOString();

const ISSUERS: IssuerRow[] = [
  {
    id: 'iss-001',
    label: 'Sales',
    phone: '521557XXXXXXX',
    status: 'connected',
    last_connected_at: '2026-05-16T08:42:00.000Z',
    created_at: '2026-03-04T10:00:00.000Z',
    has_qr: false,
  } as IssuerRow,
  {
    id: 'iss-002',
    label: 'Support',
    phone: '521555XXXXXXX',
    status: 'connected',
    last_connected_at: '2026-05-16T08:50:11.000Z',
    created_at: '2026-03-12T14:00:00.000Z',
    has_qr: false,
  } as IssuerRow,
  {
    id: 'iss-003',
    label: 'Logistics',
    phone: null as unknown as string,
    status: 'pending',
    last_connected_at: null as unknown as string,
    created_at: '2026-05-15T18:30:00.000Z',
    has_qr: true,
  } as IssuerRow,
];

const PROJECTS: ProjectRow[] = [
  {
    id: 'prj-001',
    name: 'wa-dashboard',
    store_replies: true,
    webhook_url: 'https://example.com/webhooks/wa',
    issuer_id: 'iss-001',
    issuer_label: 'Sales',
    issuer_phone: '521557XXXXXXX',
    issuer_status: 'connected',
    created_at: '2026-03-04T10:00:00.000Z',
  } as ProjectRow,
  {
    id: 'prj-002',
    name: 'support-ops',
    store_replies: true,
    webhook_url: null as unknown as string,
    issuer_id: 'iss-002',
    issuer_label: 'Support',
    issuer_phone: '521555XXXXXXX',
    issuer_status: 'connected',
    created_at: '2026-03-12T14:00:00.000Z',
  } as ProjectRow,
];

const SESSIONS: SessionRow[] = [
  {
    id: 'ses-1001',
    project_id: 'prj-001',
    issuer_id: 'iss-001',
    issuer_phone: '521557XXXXXXX',
    issuer_label: 'Sales',
    phone: '5215510000001',
    status: 'active',
    started_by: 'inbound',
    metadata: {},
    created_at: '2026-05-16T08:12:00.000Z',
    closed_at: null as unknown as string,
    outbound_count: 4,
    inbound_count: 6,
    unread_count: 2,
  } as SessionRow,
  {
    id: 'ses-1002',
    project_id: 'prj-001',
    issuer_id: 'iss-001',
    issuer_phone: '521557XXXXXXX',
    issuer_label: 'Sales',
    phone: '5215510000002',
    status: 'active',
    started_by: 'outbound',
    metadata: {},
    created_at: '2026-05-15T19:48:00.000Z',
    closed_at: null as unknown as string,
    outbound_count: 12,
    inbound_count: 9,
    unread_count: 0,
  } as SessionRow,
  {
    id: 'ses-1003',
    project_id: 'prj-002',
    issuer_id: 'iss-002',
    issuer_phone: '521555XXXXXXX',
    issuer_label: 'Support',
    phone: '5215510000003',
    status: 'closed',
    started_by: 'inbound',
    metadata: {},
    created_at: '2026-05-14T11:03:00.000Z',
    closed_at: '2026-05-14T13:20:00.000Z',
    outbound_count: 8,
    inbound_count: 5,
    unread_count: 0,
  } as SessionRow,
];

const MESSAGES: Record<string, MessageRow[]> = {
  'ses-1001': [
    {
      id: 'msg-1',
      session_id: 'ses-1001',
      project_id: 'prj-001',
      issuer_id: 'iss-001',
      direction: 'inbound',
      phone: '5215510000001',
      message_type: 'text',
      payload: { text: 'Hola, tienen llantas 225/65 R17 disponibles?' },
      wa_message_id: 'wa-aaa-001',
      quoted_wa_id: null as unknown as string,
      status: 'delivered',
      retrieved: true,
      created_at: '2026-05-16T08:12:00.000Z',
    } as MessageRow,
    {
      id: 'msg-2',
      session_id: 'ses-1001',
      project_id: 'prj-001',
      issuer_id: 'iss-001',
      direction: 'outbound',
      phone: '5215510000001',
      message_type: 'text',
      payload: { text: 'Hola! Sí, tenemos Michelin Primacy y Bridgestone Turanza en stock. ¿Te paso precios?' },
      wa_message_id: 'wa-aaa-002',
      quoted_wa_id: 'wa-aaa-001',
      status: 'sent',
      retrieved: true,
      created_at: '2026-05-16T08:13:14.000Z',
    } as MessageRow,
    {
      id: 'msg-3',
      session_id: 'ses-1001',
      project_id: 'prj-001',
      issuer_id: 'iss-001',
      direction: 'inbound',
      phone: '5215510000001',
      message_type: 'text',
      payload: { text: 'Sí porfa' },
      wa_message_id: 'wa-aaa-003',
      quoted_wa_id: null as unknown as string,
      status: 'delivered',
      retrieved: false,
      created_at: '2026-05-16T08:42:01.000Z',
    } as MessageRow,
  ],
  'ses-1002': [
    {
      id: 'msg-10',
      session_id: 'ses-1002',
      project_id: 'prj-001',
      issuer_id: 'iss-001',
      direction: 'outbound',
      phone: '5215510000002',
      message_type: 'text',
      payload: { text: 'Su pedido #INV-2026-002 está listo para entrega.' },
      wa_message_id: 'wa-bbb-001',
      quoted_wa_id: null as unknown as string,
      status: 'sent',
      retrieved: true,
      created_at: '2026-05-15T19:48:00.000Z',
    } as MessageRow,
  ],
  'ses-1003': [
    {
      id: 'msg-20',
      session_id: 'ses-1003',
      project_id: 'prj-002',
      issuer_id: 'iss-002',
      direction: 'inbound',
      phone: '5215510000003',
      message_type: 'text',
      payload: { text: 'No me llegó el código de seguimiento' },
      wa_message_id: 'wa-ccc-001',
      quoted_wa_id: null as unknown as string,
      status: 'delivered',
      retrieved: true,
      created_at: '2026-05-14T11:03:00.000Z',
    } as MessageRow,
  ],
};

const HEALTH: HealthResponse = {
  status: 'ok',
  db: 'connected',
  issuers: ISSUERS.map((i) => ({
    id: i.id,
    label: i.label,
    phone: i.phone,
    status: i.status,
  })),
  issuers_connected: ISSUERS.filter((i) => i.status === 'connected').length,
  issuers_total: ISSUERS.length,
  uptime: 86_400 * 3 + 4123,
  timestamp: NOW(),
} as HealthResponse;

const noop = async <T,>(value: T): Promise<T> => value;

export const api = {
  health: () => noop({ ...HEALTH, timestamp: NOW() }),
  sessions: () => noop({ sessions: SESSIONS }),
  sessionMessages: (id: string) =>
    noop({ messages: MESSAGES[id] ?? [] }),
  sessionUnread: (id: string) =>
    noop({ messages: (MESSAGES[id] ?? []).filter((m) => !m.retrieved) }),
  issuers: {
    list: () => noop({ issuers: ISSUERS }),
    get: (id: string) =>
      noop(
        ISSUERS.find((i) => i.id === id) ?? (ISSUERS[0] as IssuerRow),
      ),
    create: (label: string) =>
      noop({ id: `iss-demo-${Math.random().toString(36).slice(2, 8)}`, label, status: 'pending' }),
    logout: (_id: string) => noop({ success: true }),
    remove: (_id: string) => noop({ success: true }),
  },
  projects: {
    list: () => noop({ projects: PROJECTS }),
    bindIssuer: (_name: string, _issuerId: string) => noop({ success: true }),
  },
};
