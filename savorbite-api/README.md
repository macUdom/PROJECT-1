# SavorBite API — Node + Express + Supabase

Backend for the SavorBite storefront. Express for HTTP, Supabase Postgres for
data (with SQL migrations and RLS), Supabase Auth for customers/admins,
Supabase Storage for product photos, and Paystack for payments.

## Quick start

```bash
cp .env.example .env        # then fill in your Supabase + Paystack keys
npm install
npm run dev                 # http://localhost:4000/api/health
```

## Database setup (one time)

In the Supabase dashboard → **SQL Editor**, run in order:

1. `db/migrations/0001_schema.sql` — tables, enums as CHECK constraints, triggers
2. `db/migrations/0002_rls_policies.sql` — Row Level Security policies
3. Create the storage bucket for product photos:

```sql
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true);
```

Then seed categories + demo dishes (jollof, suya, zobo, etc.):

```bash
npm run db:seed
```

`npm run db:setup` does the bucket creation + seed in one shot (idempotent).

Create your first accounts through `POST /api/auth/register` (or the SPA's
register tab), then promote one to admin:

```sql
update public.profiles set role = 'admin' where id = '<uuid from auth.users>';
```

## API map

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | – | Liveness probe |
| POST | `/api/auth/register` | – | Create account (returns session token) |
| POST | `/api/auth/login` | – | Sign in (returns session token) |
| GET | `/api/auth/me` | Bearer | Current profile + role |
| GET | `/api/products?category=&search=` | – | Menu listing (public) |
| GET | `/api/products/:id` | – | One dish |
| POST | `/api/products` | Admin | Add dish |
| PUT | `/api/products/:id` | Admin | Edit dish (stock 0 ⇒ sold out) |
| DELETE | `/api/products/:id` | Admin | Remove dish (order history kept) |
| GET | `/api/categories` | – | Category list |
| POST/PUT/DELETE | `/api/categories[/:id]` | Admin | Manage categories (delete blocked while dishes reference it) |
| POST | `/api/orders` | Bearer | Create order — **totals computed server-side** |
| GET | `/api/orders/mine` | Bearer | Caller’s order history |
| GET | `/api/orders` | Admin | All orders (`?status=&search=`) |
| PATCH | `/api/orders/:id/status` | Admin | Move status along the kitchen flow |
| POST | `/api/payments/initialize` | Bearer | Start Paystack transaction for an order |
| GET | `/api/payments/verify/:reference` | – | Verify with Paystack; settles order if success + amount matches |
| GET | `/api/payments/callback` | – | Paystack redirect → bounces to the SPA |
| POST | `/api/payments/webhook/paystack` | Signature | Authoritative “paid” event (HMAC-SHA512 verified) |
| POST | `/api/uploads/product-image` | Admin | Upload photo to Supabase Storage |

## Security model

- **Money lives in kobo** (`bigint`) everywhere; the API converts to naira
  only for responses. Order totals are recalculated in
  `src/services/orderPricing.js` from database prices — client-sent prices,
  subtotals and totals are ignored.
- **Payment status is never trusted from the browser.** An order is created
  `Pending`; it becomes `Paid` only when Paystack’s verify/webhook response
  succeeds AND the amount matches the order total (`settleOrder` in the payment
  controller).
- **Roles come from the database.** `role` lives in `profiles`; the admin
  guard re-reads it on every request instead of trusting the token’s claims.
- **RLS on every table** as the second line of defence for direct SDK access.
- **Secrets stay here.** `PAYSTACK_SECRET_KEY` and
  `SUPABASE_SERVICE_ROLE_KEY` are server-only; the SPA receives only the
  Paystack public key and its own access token.
- Webhook bodies are HMAC-verified against the raw request before parsing.

## Wiring the Vue SPA

Point the frontend at this API and swap the mock services
(`savorbite/src/services/api.js`, `payment.js`) for the real endpoints:

```env
# savorbite/.env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxx
```

Login/register responses include `session.access_token` — send it as
`Authorization: Bearer <token>` on `/api/orders*` and admin calls.

## Deploy (Render)

- Build command: `npm ci --omit=dev`
- Start command: `npm start`
- Health check path: `/api/health`
- Set all `.env` values in the Render dashboard (never commit them)
