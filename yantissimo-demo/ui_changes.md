# UI Changes

## Endpoints used

- `POST /api/dist/create-with-admin`

  - Request:
    ```json
    {
      "client": {
        "name": "Cliente S.A.",
        "company_identifier": "RFC123",
        "margen": 12,
        "logo": "https://...",
        "color": "#0F172A"
      },
      "admin": {
        "name": "Admin Cliente",
        "username": "admin_cliente",
        "password": "secret"
      }
    }
    ```
  - Response (example):
    ```json
    { "client": { "id": 1 }, "admin": { "id": 10 } }
    ```

- `GET /api/dist/:id/panel`

  - Response (example):
    ```json
    {
      "id": 1,
      "name": "Distribuidor X",
      "margen": 12,
      "logo": "https://...",
      "color": "#0F172A",
      "status": "active",
      "users": [
        {
          "id": 11,
          "name": "User",
          "username": "user",
          "role": 3,
          "status": true
        }
      ]
    }
    ```

- `PUT /api/dist/:id/panel`

  - Request (new mapping):
    ```json
    {
      "margins": 12,
      "logo_url": "https://...",
      "colors": "#0F172A"
    }
    ```
  - Request (legacy mapping):
    ```json
    {
      "margen": 12,
      "logo": "https://...",
      "color": "#0F172A"
    }
    ```

- `GET /api/dist/:id/users`

  - Response: array of users.

- `POST /api/dist/:id/users`

  - Request:
    ```json
    { "name": "User", "username": "user", "password": "secret", "role": 3 }
    ```
  - Response (example): user object.

- `PUT /api/dist/:id/users/:userId`

  - Request:
    ```json
    { "name": "User", "username": "user", "role": 4 }
    ```

- `PUT /api/users/inactivate/:id`
- `PUT /api/users/reactivate/:id`

- `PUT /api/dist/:id/block`

  - Request:
    ```json
    { "action": "suspend", "reason": "Incumplimiento" }
    ```

- `GET /api/dist/send?id=:quoteId`

- `PUT /api/dist/quotes/:id/cancel`

## Notes

- The UI uses `margen/logo/color` locally and sends either `margins/logo_url/colors` or `margen/logo/color` based on the panel payload keys.
- `409` is surfaced for duplicate usernames and shows `"El nombre de usuario ya existe. Elige otro."`.
- Delete actions for `/api/users/:id` were replaced by inactivate/reactivate flows.
- Order edit UI disables editing when `quote.type !== "cartdraft"` and shows an overlay message.

## Testing

- No Jest/Cypress/Playwright tooling is configured in this repo, so automated tests were not added.
- Manual QA checklist (suggested):
  1. Crear cliente + admin (409 duplicados).
  2. Abrir `/dist/:id/panel` con admin y verificar guardar configuración.
  3. Crear usuario, inactivar, reactivar (409 en username).
  4. Enviar pedido cuando `type === cartdraft`.
  5. Cancelar pedido final y validar mensaje.
