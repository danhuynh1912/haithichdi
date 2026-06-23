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
- SEO-first approach with reusable metadata helpers and dynamic metadata for booking pages.
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

- Framework: `Next.js 15.5.6` (App Router)
- Language: `TypeScript`
- UI: `Tailwind CSS v4`, Radix primitives, custom components
- Data access: `Axios` + `@tanstack/react-query`
- Motion: `motion`
- Icons: `lucide-react`
- SEO: Metadata helpers in `lib/seo.ts`

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
  app/
    page.tsx                      # Home
    locations/                    # Location listing + detail modal
    tours/                        # Filter/search/sort tours
    tour-booking/[tourId]/        # Booking flow
    about/                        # Story + leaders
    contact/
  components/
    site-header.tsx
    ui/*                          # reusable primitives
  lib/
    api.ts                        # axios instance
    services/                     # API service layer
    hooks/                        # reusable hooks
    seo.ts                        # metadata helpers
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

## 12. Engineering Notes

- Sticky header with blur keeps navigation stable during scroll.
- Background blur and transition effects reinforce brand atmosphere.
- React Query caching reduces duplicate requests and improves perceived performance.
- `PageTransition` component exists but is currently disabled in `app/layout.tsx`.

## 13. Current Gaps / Next Improvements

- No automated tests yet (unit/integration/e2e).
- No route-level error boundary strategy yet.
- No i18n implementation yet (currently Vietnamese-first product copy).
- Could add booking funnel analytics for conversion insights.
