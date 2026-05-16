# DataKnife

Plataforma web con Next.js App Router, React, Tailwind/shadcn y OpenAI ChatKit.

## Funcionalidad

- Pantalla de inicio con carrusel de areas de negocio.
- Sidebar preparado en el layout con ruta de inicio.
- Bahia de carga documental.
- Archivos de texto/documento hacia OpenAI Vector Store.
- CSV, Excel y datos estructurados separados en un flujo placeholder para Supabase.
- ChatKit de OpenAI montado en el panel derecho.

## Variables de entorno

Copia `.env.example` a `.env.local` y configura:

```bash
OPENAI_API_KEY=sk-proj-your-key
OPENAI_VECTOR_STORE_ID=vs_your_vector_store_id
OPENAI_CHATKIT_WORKFLOW_ID=wf_your_chatkit_workflow_id
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_SQL_RPC_NAME=execute_sql
SUPABASE_SQL_RPC_ARGUMENT=sql
```

## Desarrollo

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Rutas API

- `POST /api/chatkit/session`: crea una sesion efimera de ChatKit.
- `POST /api/tools/sql`: ejecuta SQL SELECT-only contra Supabase por RPC.
- `POST /api/uploads/documents`: clasifica archivos, envia documentos al Vector Store y deja datos estructurados en placeholder.

## SQL tool para ChatKit

`src/lib/openai/sql-tool.js` expone `onSqlTool`, que ChatKit registra con `onClientTool`. El workflow ya debe tener creada la tool local con uno de estos nombres: `execute_sql`, `onSqlTool`, `sql_tool` o `query_database`.

La ruta `/api/tools/sql` valida que la consulta sea `SELECT` o `WITH ... SELECT`, fuerza `LIMIT` cuando falta, y llama a Supabase usando `supabase.rpc`.

Debes crear una funcion RPC en Supabase compatible con `SUPABASE_SQL_RPC_NAME` y `SUPABASE_SQL_RPC_ARGUMENT`. Ejemplo base:

```sql
create or replace function public.execute_sql(sql text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  execute format(
    'select coalesce(jsonb_agg(row_to_json(t)), ''[]''::jsonb) from (%s) t',
    sql
  )
  into result;

  return result;
end;
$$;
```

Usa una service role key solo en el servidor. No expongas `SUPABASE_SERVICE_ROLE_KEY` como variable publica.

## Punto de conexion futura

El flujo estructurado vive en `src/lib/uploads/structured-pipeline.ts`. Ahi se puede reemplazar el placeholder por persistencia en Supabase, colas, storage y procesamiento tabular.
