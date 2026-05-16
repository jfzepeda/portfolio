# Guia de migracion Frontend - Modulo de Cobros (modulo-cobros -> staging)

## Objetivo
Esta guia resume los cambios de API que impactan al frontend al migrar el modulo de cobros/facturacion. Incluye cambios breaking, mapeo de campos legacy -> nuevos campos canonicos y checklist de rollout.

## Resumen ejecutivo (breaking)
1. `customer_id` ahora es obligatorio al crear factura (`POST /invoices`). Ya no se acepta `cliente`.
2. Se rechazan campos deprecados en create/update de factura: `cliente`, `status`, `balance_due`, `payment_terms_days`, `folio_complemento_microsip`.
3. `metodo_pago` ya no es editable en `PUT /invoices/:id`; los ajustes de pago van por endpoints de pagos.
4. `GET /invoices/filters` cambia contrato: antes devolvia `clientes` (strings), ahora `customers` (`[{ id, name }]`).
5. `GET /invoices` y `GET /invoices/:id` ya no regresan `i.*`; regresan un set limitado (incluye `customer_name`, no incluye varios campos legacy).
6. Al facturar una orden (`PUT /orders/facturar/:id`) puede regresar `409` si el distribuidor no tiene `customer_id` vinculado.

## Endpoints de facturas (`/invoices`)

### 1) Crear factura
- Endpoint: `POST /invoices`
- Nuevo minimo requerido:
  - `esquema_precio`
  - `metodo_pago`
  - `sucursal`
  - `importe_total`
  - `piezas`
  - `quote_id` o `order_id`
  - `customer_id` (nuevo, obligatorio)
- Compatibilidad parcial:
  - `seller` sigue aceptado como alias, se normaliza a `seller_id`.
- Campos nuevos opcionales:
  - `currency` (default `MXN`)
  - `issued_at`
  - `due_date`
- Campos rechazados (400):
  - `cliente`, `status`, `balance_due`, `payment_terms_days`, `folio_complemento_microsip`

#### Ejemplo request recomendado
```json
{
  "order_id": 123,
  "type": "invoice",
  "esquema_precio": "publico",
  "metodo_pago": [
    { "metodo": "transferencia", "monto": 5000 }
  ],
  "importe_total": 5000,
  "piezas": 12,
  "sucursal": "Matriz",
  "seller_id": 4,
  "customer_id": 87,
  "currency": "MXN",
  "folio_venta_microsip": "FV-10001"
}
```

#### Notas de negocio
- Si `metodo_pago` trae desglose (objeto/arreglo), backend crea pagos automaticamente y calcula `balance_due/status`.
- Si la suma de metodos excede `importe_total`, responde `400`.

### 2) Listar facturas
- Endpoint: `GET /invoices`
- Filtros nuevos:
  - `seller_id`
  - `customer_id`
  - `status` (`pendiente|parcial|pagado` y variantes `pending|partial|paid`)
  - `only_open` (boolean parseado)
  - `overdue` (boolean parseado)
- Filtros legacy soportados:
  - `seller` (por nombre)
- Ya no existe filtro por `cliente`.

#### Booleanos validos
- `true`: `1`, `true`, `yes`, `si`, `sí`
- `false`: `0`, `false`, `no`
- Cualquier otro valor => `400`

#### Cambios de respuesta
- Orden: ahora `ORDER BY i.id DESC` (antes ascendente).
- Limite: ahora 300 (antes 200).
- Campos principales de salida:
  - `id`, `quote_id`, `order_id`, `type`, `esquema_precio`, `metodo_pago`
  - `importe_total`, `balance_due`, `currency`, `status`, `payment_terms_days`
  - `issued_at`, `due_date`, `piezas`, `sucursal`, `seller_id`, `customer_id`
  - `folio_venta_microsip`, `url_pdf_factura`, `created_at`
  - `seller_name`, `customer_name`

### 3) Obtener factura por id
- Endpoint: `GET /invoices/:id`
- Nuevo comportamiento:
  - Busca por `i.id = :id` **o** `i.order_id = :id`.
- Endpoint dedicado nuevo:
  - `GET /invoices/order/:order_id` para consulta explicita por orden.

### 4) Actualizar factura
- Endpoint: `PUT /invoices/:id`
- Ya **no** permite editar `metodo_pago`.
- Para ajustar pagos: usar `POST /invoices/:id/payments`.
- Campos editables relevantes:
  - `quote_id`, `order_id`, `type`, `esquema_precio`, `importe_total`, `piezas`, `sucursal`
  - `seller_id` (tambien acepta alias `seller`)
  - `customer_id` (si cambia, backend sincroniza `cliente` interno)
  - `currency`, `issued_at`, `due_date`, `folio_venta_microsip`, `url_pdf_factura`
- Campos deprecados tambien son rechazados aqui.

### 5) Filtros para UI
- Endpoint: `GET /invoices/filters`

#### Antes
```json
{
  "sellers": ["Ana", "Luis"],
  "clientes": ["Cliente A", "Cliente B"]
}
```

#### Ahora
```json
{
  "sellers": ["Ana", "Luis"],
  "customers": [
    { "id": 1, "name": "Cliente A" },
    { "id": 2, "name": "Cliente B" }
  ]
}
```

## Endpoints nuevos de pagos

### 1) Pagos directos de factura
- `GET /invoices/:id/payments`
- `POST /invoices/:id/payments`

#### Request `POST /invoices/:id/payments`
```json
{
  "fecha_pago": "2026-02-24T18:30:00Z",
  "metodo_pago": "transferencia",
  "monto": 1500,
  "currency": "MXN",
  "exchange_rate": null,
  "provider": "bbva",
  "provider_payload": { "referencia": "ABC123" }
}
```

#### Response
Regresa:
- `payment`: pago insertado
- `invoice`: factura recalculada (`balance_due/status`)

### 2) Reconciliar manualmente una factura
- `POST /invoices/:id/reconcile`
- Uso recomendado para botones tipo "Recalcular saldo" en UI admin.

## Endpoints nuevos de clientes CxC
- `GET /invoices/customers`
- `POST /invoices/customers`
- `PUT /invoices/customers/:id`

### Contrato base customer
```json
{
  "id": 1,
  "display_name": "Cliente A",
  "kind": "mayoreo",
  "credit_days": 30,
  "credit_limit": 100000,
  "is_active": true,
  "created_at": "2026-02-24T00:00:00.000Z"
}
```

### Filtros `GET /invoices/customers`
- `kind`: `patio|mayoreo`
- `is_active`: boolean parseado
- `searchTerm`: busca por `display_name`

## Endpoints nuevos de complementos de pago
- `GET /invoices/payment-complements`
- `POST /invoices/payment-complements`
- `GET /invoices/payment-complements/:id/payments`
- `POST /invoices/payment-complements/:id/payments`

Esto habilita UI de cobranza por complemento (REP) separada de pagos directos por factura.

## Cambios en facturacion desde orden (`/orders/facturar/:id`)
- Endpoint afectado: `PUT /orders/facturar/:id`
- Cambio:
  - Antes facturaba con `cliente` string.
  - Ahora exige `dist.customer_id`.
- Nuevo error posible:
  - `409 Distribuidor sin customer_id...`

### Implicacion FE
Antes de permitir "Facturar" desde pedidos, validar que el distribuidor tenga customer vinculado; si no, redirigir a flujo de vinculacion CxC.

## Cambios en insights (`/dist-insights`)
- `GET /dist-insights/table` ahora incluye `customer_id` en filas.
- Calculo de CxC ahora usa `invoices.balance_due/status/due_date` en vez de inferir todo por `metodo_pago`.
- `GET /dist-insights/filters`:
  - `credit_status` deja de ser fijo `['active','blocked','suspended']`.
  - Ahora se arma dinamico e incluye siempre `active` e `inactive` + valores detectados en BD.

## Mapeo de campos legacy -> canonicos
- `cliente` -> `customer_id` (+ leer `customer_name` en responses)
- `seller` -> `seller_id` (alias temporalmente aceptado)
- `folio_complemento_microsip` -> mover a flujo de `payment_complements` (ya no en factura)
- Edicion de `metodo_pago` en factura -> usar `/invoices/:id/payments`

## Plan de migracion FE (recomendado)
1. Actualizar tipos/interfaces de factura y filtros.
2. Reemplazar selectores por nombre (`cliente`) por selector por `customer_id`.
3. Cambiar forms de create/update para remover campos deprecados.
4. Implementar seccion de pagos:
   - Historial: `GET /invoices/:id/payments`
   - Alta: `POST /invoices/:id/payments`
5. Ajustar pantalla de filtros de facturas para consumir `customers` (objeto) en lugar de `clientes` (string).
6. Manejar errores nuevos (`400` por deprecados/boolean invalido, `409` en facturar orden).
7. Actualizar insights para contemplar `customer_id` y nuevo catalogo dinamico de `credit_status`.

## Checklist QA FE
- Crear factura con `customer_id` valido.
- Intentar crear factura enviando `cliente` y verificar `400` esperado.
- Editar factura sin `metodo_pago` (ok) y con `metodo_pago` (debe fallar).
- Registrar pago y verificar refresco de `balance_due/status`.
- Validar filtros `only_open` y `overdue`.
- Validar flujo de facturar orden con y sin `customer_id` en distribuidor.
- Validar que `/invoices/filters` cargue customers por `id/name`.

## Nota de compatibilidad temporal
La base conserva datos legacy para transicion (script `src/sql/cxc-deprecation-final.sql`), pero la API ya opera en modelo canonico CxC. Frontend debe dejar de depender de `cliente` y campos deprecados para evitar bloqueos en alta/edicion.
