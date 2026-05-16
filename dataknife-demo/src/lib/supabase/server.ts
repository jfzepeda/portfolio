import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Configura SUPABASE_URL en .env.local.");
  }

  if (!serviceRoleKey) {
    throw new Error("Configura SUPABASE_SERVICE_ROLE_KEY en .env.local.");
  }

  supabaseClient ??= createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseClient;
}

export function getSqlRpcConfig() {
  return {
    name: process.env.SUPABASE_SQL_RPC_NAME ?? "execute_sql",
    argument: process.env.SUPABASE_SQL_RPC_ARGUMENT ?? "sql",
  };
}
