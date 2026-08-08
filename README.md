# Hai Thich Di Frontend

Production-oriented frontend for the `Hai Thich Di` trekking booking platform, built with Next.js App Router and TypeScript.

## 1. Product Context

This app is designed to:
- Present the brand story and values: "Trekking - Connection - Community Support".
- Help users discover destinations and tours with filter/search tools.
- Highlight hot tours and drive users into the booking funnel.
- Collect valid tour registrations through a business-aware booking form.

This is not a generic UI showcase. It is a product-focused frontend connected to a real backend domain model.

## 2. Recruiter Highlights

Key engineering signals:
- Clear layering: `UI -> hooks -> services -> API client`.
- Server state handled with TanStack React Query (cache, loading, error).
- SEO-first approach with reusable metadata helpers, dynamic metadata for booking pages, and per-locale canonical/hreflang.
- Full vi/en internationalisation with a single-source-of-truth message catalogue guarded by a CI check.
- URL-driven state (`/locations?name=...`) for deep-linking and refresh-safe UX.
- Modern form handling with `useActionState` and `useFormStatus`.
- Intentional motion and responsive UX for desktop and mobile.

## 3. Core Features

- Home:
  - Hero section with brand positioning.
  - Hot Tours panel fetched from backend.
- Locations:
  - Destination carousel.
  - Fullscreen detail modal with PDF quotation preview (left) and upcoming tours (right).
  - Query param sync (`name`) so shared links and reload preserve modal context.
- Tours:
  - Filter by location.
  - Debounced search.
  - Sort by upcoming start date.
- Tour Booking:
  - Tour detail fetched via React Query.
  - PDF quotation preview.
  - Booking form with required business fields (`medal_name`, `dob`, `citizen_id`).
- About:
  - Leader profiles loaded from API.
  - Fallback profile data if API is unavailable.

## 4. Tech Stack

- Framework: `Next.js 16` (App Router)
- Language: `TypeScript`
- UI: `Tailwind CSS v4`, Radix primitives, custom components
- Data access: `Axios` + `@tanstack/react-query`
- Motion: `motion`
- Icons: `lucide-react`
- SEO: Metadata helpers in `lib/seo.ts`
- i18n: `next-intl` with the locale in the URL (`vi` default, `/en` prefixed)
- Tests: `Vitest` + Testing Library

## 5. Architecture Overview

```text
Browser UI
  -> app/* pages + components/*
  -> reusable hooks (useDebounce, useTours)
  -> service layer (lib/services/*)
  -> axios client (lib/api.ts)
  -> Django REST API (backend)
  -> PostgreSQL + MinIO (media/PDF)
```

All API calls go through service modules to keep components clean and improve testability, reuse, and scalability.

## 6. Project Structure

```text
frontend/
  proxy.ts                        # next-intl locale routing (Next 16 middleware)
  messages/
    vi.json                       # SSOT for Vietnamese copy (reference catalogue)
    en.json                       # English copy, key-for-key with vi.json
  i18n/
    routing.ts                    # locales, default, prefix strategy, path helpers
    navigation.ts                 # locale-aware Link / useRouter / usePathname
    request.ts                    # per-request config (messages, formats, TZ)
    formats.ts                    # shared date/number presets
  app/
    [locale]/
      page.tsx                    # Home
      locations/                  # Location listing + detail modal
      tours/                      # Filter/search/sort tours
      tour-booking/[tourId]/      # Booking flow
      about/                      # Story + leaders
      contact/
    sitemap.ts                    # both locales + hreflang alternates
    robots.ts
  components/
    site-header.tsx
    language-switcher.tsx
    ui/*                          # reusable primitives
  lib/
    api.ts                        # axios instance
    types.ts                      # shared domain shapes
    services/                     # API service layer
    hooks/                        # reusable hooks
    services/queries.ts           # locale-bound React Query hooks (SSOT for keys)
    seo.ts                        # locale-aware metadata helpers
    utils.ts
  hooks/
    use-media-query.ts
```

## 7. Consumed API Endpoints

- `GET /api/tours/hot/`
- `GET /api/tours/?location_id=1,2&search=...&ordering=start_date`
- `GET /api/tours/:id/`
- `GET /api/locations/`
- `GET /api/leaders/`
- `POST /api/bookings/`

Booking request payload:

```json
{
  "tour": 1,
  "full_name": "Nguyen Van A",
  "phone": "0900000000",
  "email": "a@example.com",
  "note": "Need more consultation",
  "medal_name": "NGUYEN VAN A",
  "dob": "1998-05-13",
  "citizen_id": "012345678901"
}
```

## 8. Environment Variables

Create `frontend/.env`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
SERVER_API_BASE_URL=http://backend:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_MEDIA_BASE_URL=http://localhost:9000
```

Meaning:
- `NEXT_PUBLIC_API_BASE_URL`: used by client-side API calls.
- `SERVER_API_BASE_URL`: used by server-side metadata fetch in booking route.
- `NEXT_PUBLIC_SITE_URL`: used for canonical URLs and social metadata.
- `NEXT_PUBLIC_MEDIA_BASE_URL`: optional image/media origin allow-list for `next/image`.

## 9. Run Locally

Prerequisites:
- Node.js 20+ (22+ recommended)
- Backend API running on configured URL

Commands:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## 10. Run with Docker Compose (Full Stack)

From repository root:

```bash
docker compose --env-file ./frontend/.env up -d --build
```

This starts `frontend`, `backend`, `db`, `minio`, and `minio-init`.

## 11. Scripts

- `npm run dev`: start development server
- `npm run build`: production build
- `npm run start`: run production server
- `npm run lint`: lint with ESLint
- `npm run test` / `npm run test:run`: Vitest in watch / CI mode
- `npm run i18n:check`: assert every locale catalogue matches `messages/vi.json`
  key-for-key, including ICU placeholders

## 12. Internationalisation (vi / en)

Built on `next-intl` with the locale in the URL.

**Routing.** `i18n/routing.ts` is the single source of truth: `vi` is the default
and keeps its bare paths (`/tours`), `en` is prefixed (`/en/tours`). Locale
auto-detection is **off** on purpose — with an `as-needed` prefix, detecting from
`Accept-Language` would make `/tours` serve two different languages from one URL,
which breaks canonical tags and CDN caching. Every URL maps to exactly one
language; the header switcher is how readers change locale.

**Copy.** All user-facing strings live in `messages/*.json` and nowhere else.
`messages/vi.json` is the reference catalogue — it types every `t()` call via
`global.d.ts`, so an unknown key is a TypeScript error, and `npm run i18n:check`
fails the build if `en.json` drifts from it.

Consequently the service layer carries **no** user-facing text: `lib/services/booking.ts`
exposes a status *tone*, `lib/services/tour.ts` throws a `BookingError` carrying a
*code*, and the UI translates both (`bookingStatus.*`, `bookingErrors.*`).

**Navigation.** Always import `Link`, `useRouter`, `usePathname` and `redirect`
from `@/i18n/navigation` — they carry the active locale prefix automatically.
Importing from `next/link` or `next/navigation` silently drops the locale.

**Formatting.** Dates and prices go through `useFormatter()` with the presets in
`i18n/formats.ts`, so `2.999.999 ₫` (vi) and `₫2,999,999` (en) come from one place.

**SEO.** `lib/seo.ts` emits a self-referential canonical plus `hreflang`
alternates for every locale; `app/sitemap.ts` emits one entry per page × locale
with the same alternates, and `app/robots.ts` blocks the private routes in every
locale.

**Database content.** Translatable columns have a suffixed sibling — `title` holds
Vietnamese, `title_en` holds English (`supabase/migrations/0006_i18n_columns.sql`).
An empty sibling means "not translated yet" and falls back to the base column, so
a half-translated tour renders Vietnamese for the fields nobody has got to.

**The fallback is resolved in SQL, not in React.** Every read RPC takes
`p_locale` and returns one already-chosen string per field
(`supabase/migrations/0007_i18n_rpc.sql`), so components read `tour.title` and
never learn the convention exists. `p_locale` defaults to `'vi'`, which is what
makes the migration safe to apply before the frontend passes a locale.

**Query keys must carry the locale.** `lib/services/queries.ts` binds the active
locale to both the request and the React Query cache key. Prefer adding a hook
there over calling `useQuery` with a service function directly — a key missing
its locale serves the previous language's rows after a switch, with no refetch
and nothing visibly broken.

### Adding a locale

1. Add the code to `routing.locales` and the `LOCALE_TAG` / `OG_LOCALE` /
   `LOCALE_LABEL` maps in `i18n/routing.ts`.
2. Copy `messages/vi.json` to `messages/<code>.json` and translate it.
3. Run `npm run i18n:check`.

Nothing else needs touching — the switcher, sitemap, robots and hreflang maps all
derive from `routing.locales`.

## 13. Engineering Notes

- Sticky header with blur keeps navigation stable during scroll.
- Background blur and transition effects reinforce brand atmosphere.
- React Query caching reduces duplicate requests and improves perceived performance.
- `PageTransition` component exists but is currently disabled in the root layout.
- `test-utils.tsx` exposes `renderIntl()`, which wraps components in the real
  message catalogue so tests assert against shipped copy, not stubs.

## 14. Current Gaps / Next Improvements

- The `_en` columns exist but are empty — English visitors see Vietnamese tour
  content until someone fills them in. The admin list flags which tours still lack
  a translation.
- No route-level error boundary strategy yet.
- Test coverage is limited to view models, services and a few components.
- Could add booking funnel analytics for conversion insights.
