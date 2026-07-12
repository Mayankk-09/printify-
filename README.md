# PrintFlow

> Production-ready document printing management platform. Students upload documents, purchase page-based packs, and collect printed documents through an admin-managed workflow.

Built with Next.js 15, React 19, TypeScript, PostgreSQL, Prisma ORM, Supabase Storage, and Razorpay.

---

## Features

- **OTP Authentication** — Email-based login with JWT sessions and Gmail SMTP delivery
- **Student Dashboard** — Page balance tracking, active orders, order history, profile
- **Admin Dashboard** — KPI cards, order management, user list, pack/addon CRUD, analytics, settings
- **Role-based Authorization** — Middleware-level route protection for student and admin roles
- **Page-based Subscription Packs** — Configurable packs with B&W only or B&W + Color modes
- **One-time Trial Pack** — Free B&W printing (up to 5 pages) for first-time users
- **Dynamic Pricing Engine** — Per-page pricing, pack discounts, add-on costs, and coupon support
- **Document Upload** — PDF, DOCX, PPTX support (15 MB max) stored in Supabase Storage
- **Automatic Page Counting** — Page count extraction for PDF, DOCX, PPTX, and PPT files
- **Print Configuration** — B&W / Color, single / double-sided, 1–10 copies
- **Configurable Add-ons** — Staple, punch holes, covers, folders with per-item pricing
- **Pickup Scheduling** — Date selection with predefined time slots and cutoff times
- **Order Tracking** — SUBMITTED → ACCEPTED → PRINTING → READY → COLLECTED lifecycle
- **Pickup Codes** — Auto-generated unique codes for document collection
- **Coupon System** — Percentage discounts and free-page credits (first-order only)
- **Razorpay Payments** — Secure checkout with HMAC verification and webhook support
- **Supabase Storage** — Cloud file storage with signed URL access
- **Automatic Cleanup** — Document deletion after configurable retention period
- **PWA Support** — Installable web app with service worker caching
- **Mobile Responsive** — Fully responsive design with sidebar navigation

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| Backend | Next.js API Routes |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Authentication | Custom JWT (jose, HS256) + OTP via Gmail SMTP |
| Storage | Supabase Storage |
| Payments | Razorpay (checkout, webhooks, HMAC verification) |
| Email | Gmail SMTP (Nodemailer) |
| Validation | Zod |
| Styling | Custom CSS (CSS Variables, zero border-radius editorial design) |
| Icons | Lucide React |
| Deployment | Vercel |

---

## Architecture

```
User → Auth (OTP + JWT) → Upload → Supabase Storage → Neon PostgreSQL
  → Pricing Engine → Razorpay Payment → Order Created
  → Admin Dashboard → Printing → Pickup Code Generated
  → Student Collects → Automatic Cleanup
```

### Order Lifecycle

```
SUBMITTED ──→ ACCEPTED ──→ PRINTING ──→ READY ──→ COLLECTED
                  │            │            │
                  └────────────┴────────────┘
                         CANCELLED
```

Each transition is triggered by the admin. A unique pickup code is auto-generated when an order reaches **READY**.

---

## Folder Structure

```
prisma/
├── schema.prisma            # Database models, enums, relations
├── seed.ts                  # Default data (admin, packs, addons, settings)
└── clear-data.ts            # Delete student data, preserve admins

src/
├── app/
│   ├── login/               # OTP login flow
│   ├── (auth)/              # Auth route group
│   ├── (dashboard)/         # Student pages (sidebar layout)
│   ├── (admin)/             # Admin pages (admin nav layout)
│   └── api/                 # REST API endpoints
├── components/              # Reusable UI components
├── lib/                     # Auth, storage, pricing, validations, utilities
├── types/                   # TypeScript type definitions
└── middleware.ts            # Route protection
```

---

## Installation

### Prerequisites

- Node.js 18+
- A Neon PostgreSQL database ([neon.tech](https://neon.tech))
- A Supabase project ([supabase.com](https://supabase.com))

### Setup

```bash
git clone https://github.com/your-org/printflow.git
cd printflow
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

The application starts at `http://localhost:4000`.

### Default Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@printify.com` | `admin123` |
| Student | Register via OTP at `/login` | — |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string (Neon) |
| `SESSION_SECRET` | Yes | JWT signing secret (HS256) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `RAZORPAY_KEY_ID` | Yes | Razorpay API key ID |
| `RAZORPAY_KEY_SECRET` | Yes | Razorpay API key secret |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Yes | Razorpay key for client-side checkout |
| `RAZORPAY_WEBHOOK_SECRET` | Yes | Razorpay webhook signature secret |
| `GMAIL_USER` | Yes | Gmail address for OTP delivery |
| `GMAIL_APP_PASSWORD` | Yes | Gmail app password for SMTP |
| `NEXT_PUBLIC_APP_NAME` | Yes | Application name |
| `NEXT_PUBLIC_APP_URL` | Yes | Application URL |

Generate a secure session secret with: `openssl rand -base64 64`

---

## Database

**Neon PostgreSQL** with **Prisma ORM**. The schema defines 12 models including User, Pack, Addon, Subscription, Order, Payment, UploadedFile, PickupCode, PickupSetting, SystemSetting, and Coupon.

### Commands

| Command | Description |
|---|---|
| `npx prisma generate` | Generate Prisma Client |
| `npx prisma db push` | Push schema changes to database |
| `npx prisma migrate dev` | Create and apply migrations |
| `npm run db:seed` | Seed default admin, packs, addons, settings |
| `npm run db:clear` | Delete student data (preserves admins) |
| `npm run db:studio` | Open Prisma Studio GUI |

---

## File Storage

**Supabase Storage** stores all uploaded documents in a cloud bucket.

- Files stored at `{userId}/{timestamp}-{random}-{sanitizedName}`
- Signed URLs with 1-hour expiry for secure access
- Validated for type (PDF, DOC, DOCX, PPT, PPTX) and size (15 MB max)
- **Automatic cleanup** deletes documents 48 hours after order collection
- Only file metadata and URLs are stored in PostgreSQL

---

## Authentication

Custom JWT authentication built with the `jose` library.

| Component | Details |
|---|---|
| Algorithm | HS256 |
| Token Expiry | 7 days |
| Cookie | `session` (httpOnly, secure, sameSite: lax) |
| OTP Delivery | Gmail SMTP via Nodemailer |
| OTP Expiry | 5 minutes |

**Flow:** Enter email → receive 6-digit OTP → verify → JWT issued → cookie set → route access granted.

Route protection is enforced at the middleware level with role-based guards (`requireAuth`, `requireAdmin`, `requireStudent`).

---

## Subscription Packs

Page-based packs with no time-based expiry. Pages are consumed as orders are placed.

### Default Packs

| Pack | Price | Pages | Print Mode | Per-Page Cost |
|---|---|---|---|---|
| 50 Pages | ₹249 | 50 | B&W + Color | ₹4.98 |
| 100 Pages | ₹399 | 100 | B&W + Color | ₹3.99 |
| 150 Pages | ₹549 | 150 | B&W + Color | ₹3.66 |

### Trial Pack

- One-time free trial for first-time users
- Up to **5 B&W pages** at no cost
- Cannot be combined with add-ons
- Automatically applied when eligible

---

## Pricing

The pricing engine calculates costs based on page type, pack coverage, add-ons, and coupons.

| Component | Details |
|---|---|
| B&W Page | ₹5 per page (configurable) |
| Color Page | ₹10 per page (configurable) |
| Pack Discount | Covered pages are free |
| Add-ons | Per-item cost × copy count |
| Coupons | Percentage or free-page credits (first order only) |
| Trial Orders | Free for eligible B&W orders |

All prices stored in paise. Divide by 100 for ₹.

---

## Admin Features

| Feature | Description |
|---|---|
| Dashboard | KPI cards for revenue, orders, students, active packs |
| Orders | Search, filter by status/date, advance lifecycle, correct page counts |
| Users | Searchable student list with subscription details |
| Packs | Create, edit, delete subscription packs |
| Add-ons | Manage add-on services and pricing |
| Subscriptions | View all active and expired subscriptions |
| Analytics | Revenue, cost, profit margin, throughput metrics |
| Settings | Configure pricing, file limits, pickup rules, run cleanup |

---

## Student Features

| Feature | Description |
|---|---|
| Dashboard | Page balance, active orders, quick actions |
| Upload | Drag-and-drop with automatic page counting |
| Configure | Copies, print mode, sides, add-ons, pickup slot |
| Subscribe | Browse and purchase page-based packs |
| Current Orders | Track active orders through the pipeline |
| Order History | View completed and cancelled orders |
| Profile | View and edit personal information |

---

## Security

| Measure | Implementation |
|---|---|
| JWT Sessions | HS256-signed tokens via jose, 7-day expiry |
| Secure Cookies | httpOnly, secure (production), sameSite: lax |
| Route Protection | Middleware-level JWT verification |
| Role-based Access | Server-side guard functions |
| Input Validation | Zod schemas for all API inputs |
| File Validation | Type checking, size limits, sanitized names |
| Webhook Verification | HMAC SHA256 for Razorpay webhooks |
| SQL Injection Protection | Prisma ORM parameterized queries |
| Signed URLs | Time-limited Supabase signed URLs for file access |

---

## Deployment

### Vercel

```bash
npm run build
vercel --prod
```

### Production Checklist

1. Run `npx prisma migrate deploy`
2. Run `npm run db:seed` once
3. Set all environment variables
4. Ensure the Supabase `Documents` bucket exists
5. Switch Razorpay to live keys and configure webhooks
6. Verify Gmail app password is valid

### Scripts

| Script | Description |
|---|---|
| `npm run dev` | Development server (port 4000) |
| `npm run build` | Production build |
| `npm run start` | Production server (port 4000) |
| `npm run typecheck` | TypeScript type checking |
| `npm run lint` | ESLint |

---

## Roadmap

| Feature | Status |
|---|---|
| QR-based Pickup | Planned |
| Push Notifications | Planned |
| Email Notifications (Resend) | Planned |
| Bulk Printing | Planned |
| Institution Management | Planned |
| Advanced Analytics & Export | Planned |
| SMS/WhatsApp Alerts | Planned |
| Coupon & Referral System | Planned |
| Multi-Campus Support | Planned |
| Print Queue Display | Planned |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make your changes
4. Run `npm run typecheck` and `npm run build`
5. Push and open a Pull Request

**Conventions:** Server components by default, validate with Zod, use CSS variables from `globals.css`, access Prisma through the singleton client in `src/lib/prisma.ts`.

---

## License

MIT License — Copyright (c) 2026 PrintFlow

## Developer

| | |
|---|---|
| GitHub | [github.com/your-org/printflow](https://github.com/your-org/printflow) |
| Issues | [github.com/your-org/printflow/issues](https://github.com/your-org/printflow/issues)
