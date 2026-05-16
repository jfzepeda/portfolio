export interface SessionRow {
  id: string;
  project_id: string;
  issuer_id: string | null;
  issuer_phone: string | null;
  issuer_label: string | null;
  phone: string;
  status: 'active' | 'closed' | 'paused';
  started_by: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  closed_at: string | null;
  outbound_count: number;
  inbound_count: number;
  unread_count: number;
}

export interface MessageRow {
  id: string;
  session_id: string;
  project_id: string;
  issuer_id: string | null;
  direction: 'outbound' | 'inbound';
  phone: string;
  message_type: 'text' | 'image' | 'document' | 'video';
  payload: { text?: string; raw?: string; url?: string; caption?: string };
  wa_message_id: string | null;
  quoted_wa_id: string | null;
  status: string;
  retrieved: boolean;
  created_at: string;
}

export interface ProjectRow {
  id: string;
  name: string;
  store_replies: boolean;
  webhook_url: string | null;
  issuer_id: string | null;
  issuer_label: string | null;
  issuer_phone: string | null;
  issuer_status: 'pending' | 'connected' | 'disconnected' | null;
  created_at: string;
}

export interface IssuerRow {
  id: string;
  label: string;
  phone: string | null;
  status: 'pending' | 'connected' | 'disconnected';
  last_connected_at: string | null;
  created_at: string;
  has_qr: boolean;
}

export interface HealthIssuer {
  id: string;
  label: string;
  phone: string | null;
  status: 'pending' | 'connected' | 'disconnected';
}

export interface HealthResponse {
  status: string;
  db: string;
  issuers: HealthIssuer[];
  issuers_connected: number;
  issuers_total: number;
  uptime: number;
  timestamp: string;
}
