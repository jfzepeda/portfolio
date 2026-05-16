**API Reference: Complementos de Pago (CxC)**
Base path: `/api`  
Auth: estas rutas están detrás de `authMiddleware`.

**Flujo para crédito + múltiples facturas + múltiples métodos**

1. Listar facturas abiertas del cliente.
2. Crear cabecera del complemento (`payment_complements`).
3. Crear uno o varios nodos de pago dentro del complemento (`payments`), uno por método/moneda.
4. Relacionar cada nodo de pago contra una o varias facturas (`payment_complement_relations`).
5. Verificar saldo/estatus en las facturas.

### 1) Seleccionar facturas de crédito abiertas

`GET /api/invoices?customer_id=:customerId&only_open=true`

Ejemplo:

```bash
curl -X GET "$BASE/api/invoices?customer_id=42&only_open=true" \
  -H "Authorization: Bearer $TOKEN"
```

### 2) Crear complemento (cabecera)

`POST /api/invoices/payment-complements`

Body:

```json
{
  "customer_id": 42,
  "status": "draft",
  "folio_microsip": "REP-2026-0001"
}
```

### 3) Crear pagos (nodos Pago) dentro del complemento

`POST /api/invoices/payment-complements/:id/payments`

Body:

```json
{
  "fecha_pago": "2026-02-24T16:30:00Z",
  "metodo_pago": "spei",
  "monto": 1500.0,
  "currency": "MXN",
  "exchange_rate": null,
  "provider": "bbva",
  "provider_payload": { "ref": "ABC123" }
}
```

Notas:

- Para “diferentes métodos”, crea varios pagos en el mismo complemento.
- `forma_pago` se deriva automáticamente desde `metodo_pago`; si no mapea, usa `99`.
- Respuesta devuelve columnas públicas del pago (no incluye `forma_pago/moneda/tipo_cambio`).

### 4) Aplicar pagos a varias facturas (DoctoRelacionado)

No hay endpoint dedicado en `/invoices`; se usa PGREST genérico:

`POST /api/pgrest/payment_complement_relations`

Body mínimo recomendado:

```json
{
  "payment_id": 9001,
  "invoice_id": 1201,
  "imp_pagado": 700.0
}
```

Puedes enviar también:

- `id_documento`, `moneda_dr`, `equivalencia_dr`, `num_parcialidad`,
- `imp_saldo_ant`, `imp_saldo_insoluto`, `objeto_imp_dr`.

Reglas DB importantes:

- `payment_id` debe apuntar a un pago de complemento (`payment_complement_id`), no a pago simple de factura (`invoice_id`).
- `sum(imp_pagado)` por `payment_id` no puede exceder `payments.monto`.
- `UNIQUE(payment_id, invoice_id)`: no puedes repetir la misma factura en el mismo nodo de pago.
- La factura debe tener `uuid_cfdi` para relación SAT (según trigger).

### 5) Consultar pagos del complemento

`GET /api/invoices/payment-complements/:id/payments`

### 6) Verificar factura y saldo actualizado

`GET /api/invoices/:id`  
Opcional manual: `POST /api/invoices/:id/reconcile`

---

**Ejemplo end-to-end (varias facturas + distintos métodos)**

1. Crear complemento `id=501`.
2. Crear pago A `spei` por `1200` (`payment_id=9001`).
3. Crear pago B `tarjeta_credito` por `800` (`payment_id=9002`).
4. Crear relaciones:

- `9001 -> factura 1201, imp_pagado 700`
- `9001 -> factura 1202, imp_pagado 500`
- `9002 -> factura 1203, imp_pagado 800`

Así un mismo complemento agrupa múltiples métodos y múltiples facturas.

**Referencias en tu código**

- [invoices.routes.js:426](/Users/juanfelipezepeda/Developer/YSSM/backend-yssm/src/routes/invoices.routes.js:426)
- [invoices.routes.js:548](/Users/juanfelipezepeda/Developer/YSSM/backend-yssm/src/routes/invoices.routes.js:548)
- [pgrest.routes.js:22](/Users/juanfelipezepeda/Developer/YSSM/backend-yssm/src/routes/pgrest.routes.js:22)
- [cxc.sql:233](/Users/juanfelipezepeda/Developer/YSSM/backend-yssm/src/sql/cxc.sql:233)

Si quieres, te lo dejo también como colección Postman lista para importar (`.json`) con todos estos requests.
