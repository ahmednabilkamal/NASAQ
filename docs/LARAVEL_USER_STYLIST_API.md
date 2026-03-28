# Laravel API — User & Stylist (for NASAQ React Native)

This document describes the **Laravel backend** endpoints the mobile app uses for **clients (users)** and **stylists**, plus what you need configured so calls succeed.

---

## 1. Base URL (React Native)

The app’s Axios instance uses **`EXPO_PUBLIC_SERVER_URL`** as `baseURL` (see `config/baseurl.ts`).

- **Set in** `.env` at the project root (Expo):

  ```env
  EXPO_PUBLIC_SERVER_URL=http://YOUR_LAN_IP:8000/api
  ```

- **Rules**
  - Must include the `/api` suffix (paths in `config/apiService.ts` are like `/stylists`, `/user/login`).
  - **No trailing slash** on the base URL.
  - Use a LAN IP the **device/emulator** can reach (not only `localhost` on a physical phone).

**Full URL examples**

| App path        | Full URL example                          |
|-----------------|-------------------------------------------|
| `GET /stylists` | `http://192.168.x.x:8000/api/stylists`    |
| `POST /user/login` | `http://192.168.x.x:8000/api/user/login` |

---

## 2. Standard JSON response shape

Most endpoints use `App\Support\ApiResponse`:

**Success**

```json
{
  "success": true,
  "message": "Success",
  "data": { },
  "meta": null
}
```

**Paginated list** (`meta` includes `current_page`, `per_page`, `total`, `last_page`, `has_more`, etc.)

**Error**

```json
{
  "success": false,
  "message": "Human readable message",
  "errors": { }
}
```

The React Native Axios interceptor reads `message` and `errors` for toasts.

---

## 3. Authentication (required for `/api/user/*` except auth)

- **Guard**: Sanctum **personal access tokens** (`auth:user` middleware).
- **Header**:

  ```http
  Authorization: Bearer <plainTextToken>
  Accept: application/json
  Content-Type: application/json
  ```

- **Token source** (after login / Google login): `data.token` in the success payload (along with `data.user`).
- **App storage**: `config/authToken.ts` — SecureStore key `venus_access_token`; Axios attaches the token in `config/axios.ts`.

**Register** in this API returns the user model only (check your app: you may need a follow-up login or token endpoint depending on backend version).

---

## 4. Public API (`routes/api.php`) — prefix `/api`

Used without auth (stylist listing, etc.).

| Method | Path | Description |
|--------|------|-------------|
| GET | `/banners` | Banners |
| GET | `/stylists` | Paginated stylists (`per_page`, `search`) |
| GET | `/stylists/trusted` | Trusted stylists |
| GET | `/stylists/recommended-services` | Recommended services |
| GET | `/stylists/{stylist_id}` | Stylist details |
| GET | `/fashion-styles` | Fashion styles |
| GET | `/categories` | Categories (e.g. for services) |

**Payment callbacks (server / Moyasar, not called from the app directly)**

| Method | Path |
|--------|------|
| POST | `/api/payments/invoice-callback` |
| POST | `/api/payments/webhook` |

---

## 5. User API (`routes/user.php`) — prefix `/api/user`

Registered in `bootstrap/app.php` with middleware `api` and prefix `api/user`.

### 5.1 Auth (no Bearer token)

| Method | Path | Notes |
|--------|------|--------|
| POST | `/register` | Multipart possible if `image` file |
| POST | `/login` | Body: `login` (email or phone), `password`, optional `device_name` |
| POST | `/google-login` | `id_token`, optional `device_name` |
| POST | `/send-otp` | `login` |
| POST | `/verify-otp` | Per backend implementation |

### 5.2 Authenticated user (Bearer token)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/update` | Profile update (may include `image`, `fashion_styles`, etc.) |
| POST | `/logout` | Revoke current token |
| GET | `/profile` | Current user |
| POST | `/push-token` | `expo_push_token` |
| DELETE | `/push-token` | Clear push token |
| POST | `/change-password` | Per request rules |

**Saved cards**

| Method | Path |
|--------|------|
| GET | `/cards` |
| POST | `/cards` |
| DELETE | `/cards/{card}` |

**Addresses**

| Method | Path |
|--------|------|
| GET | `/addresses` |
| POST | `/addresses` |
| POST | `/addresses/{address}` | update |
| DELETE | `/addresses/{address}` |

**Reviews**

| Method | Path |
|--------|------|
| POST | `/reviews` | e.g. product / stylist review per `ReviewController` |

**Favorites**

| Method | Path |
|--------|------|
| GET | `/favorites` |
| POST | `/favorites/toggle` | body: `stylist_id` |

**Orders**

| Method | Path |
|--------|------|
| GET | `/orders` | query: `per_page`, `page`, etc. |
| POST | `/orders` | e.g. `stylist_service_id`, `notes` |

**Payments**

| Method | Path |
|--------|------|
| GET | `/payments/config` | Returns `publishable_key` for Moyasar (client) |
| POST | `/payments/initiate` | body: `order_id` → returns `payment_url` when gateway is configured |

**Chat (client)**

| Method | Path |
|--------|------|
| GET | `/chat/conversations` |
| POST | `/chat/conversations` | body: `stylist_id` |
| GET | `/chat/conversations/{conversation}/messages` |
| POST | `/chat/conversations/{conversation}/messages` | JSON `{ body }` or `FormData` for media |

**Tickets**

| Method | Path |
|--------|------|
| GET | `/tickets` |
| POST | `/tickets` |
| GET | `/tickets/{ticket}` |
| POST | `/tickets/{ticket}/reply` |

---

## 6. Stylist API — same prefix `/api/user`, under `/stylist`

### 6.1 Any authenticated user (become a stylist / complete profile)

| Method | Path | Description |
|--------|------|-------------|
| PUT | `/stylist/profile` | Complete stylist profile (`StylistProfileController@update`) |

### 6.2 Stylist-only (`middleware('stylist')` — user must have **role stylist**)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/stylist/profile` | Show stylist profile |
| PATCH | `/stylist/profile` | Patch stylist profile |
| GET | `/stylist/orders` | Stylist’s orders |
| GET | `/stylist/services` | List services |
| POST | `/stylist/services` | Create service |
| PUT | `/stylist/services/{id}` | Update service |
| DELETE | `/stylist/services/{id}` | Delete service |

**Stylist chat**

| Method | Path |
|--------|------|
| GET | `/stylist/chat/conversations` |
| GET | `/stylist/chat/conversations/{conversation}/messages` |
| POST | `/stylist/chat/conversations/{conversation}/messages` |

---

## 7. Laravel `.env` — minimum for API + payments

```env
APP_URL=http://YOUR_PUBLIC_OR_LAN_HOST:8000

# Sanctum / app
APP_KEY=base64:...

# Moyasar (used by PaymentController + MoyasarService)
MOYASAR_API_KEY=pk_live_xxx_or_test_xxx
MOYASAR_SECRET_KEY=sk_live_xxx_or_test_xxx
```

- **Invoice URLs** are built from `config('app.url')` for callbacks (`/api/payments/invoice-callback`, success/failure redirects). For local dev, `APP_URL` must be reachable by Moyasar where required, or use test keys and tunneling if needed.
- If `MOYASAR_SECRET_KEY` is empty, initiation may fail with a gateway / configuration error.

**Google login (optional)**

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_IOS_CLIENT_ID=
GOOGLE_ANDROID_CLIENT_ID=
```

---

## 8. CORS & mobile

- JSON API uses `api` middleware; ensure your HTTP client sends **`Accept: application/json`** (Axios already does).
- If you ever call the API from a browser build, configure Laravel CORS for your origin. **Native React Native** requests are not subject to browser CORS.

---

## 9. Mapping to this repo’s `apiService.ts`

All paths below are **relative to** `baseURL` (`.../api`):

- Public: `/stylists`, `/banners`, …
- User: `/user/...` (e.g. `/user/orders`, `/user/payments/initiate`)
- Stylist: `/user/stylist/...`

Keep `EXPO_PUBLIC_SERVER_URL` aligned with the machine running `php artisan serve` (or your reverse proxy).

---

## 10. Quick health check

From a terminal (replace host/port):

```bash
curl -s http://127.0.0.1:8000/api/banners
curl -s -X POST http://127.0.0.1:8000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"login":"client@example.com","password":"password","device_name":"curl"}'
```

You should see `success: true` and a `data.token` on successful login.
