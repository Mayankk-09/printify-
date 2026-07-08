# Printify

> Production-ready campus printing platform — students upload documents, pick a plan, and collect prints. Print operators manage the entire workflow from a single dashboard.

**Stack:** Next.js 15 · React 19 · TypeScript · PostgreSQL (Neon) · Prisma ORM · NextAuth v5 · Razorpay · AWS S3 · Zod

---

## Table of Contents

- [Project Overview](#1-project-overview)
- [Features](#2-features)
- [Project Structure](#3-project-structure)
- [Environment Variables](#4-environment-variables)
- [Local Development Setup](#5-local-development-setup)
- [Database Setup](#6-database-setup)
- [Authentication Flow](#7-authentication-flow)
- [Order Lifecycle](#8-order-lifecycle)
- [Subscription System](#9-subscription-system)
- [File Upload Flow](#10-file-upload-flow)
- [Deployment Guide](#11-deployment-guide)
- [Common Errors & Fixes](#12-common-errors--fixes)
- [Future Roadmap](#13-future-roadmap)
- [Contributing](#14-contributing)
- [License](#15-license)

---

## 1. Project Overview

### What Printify Does

Printify bridges the gap between students who need documents printed and the campus print room that fulfills them. Instead of emailing files or using USB drives, students subscribe to a printing plan, upload documents through a web portal, configure print options, pick a timeslot, and collect their prints using a unique pickup code.

### Student Workflow

```
Register → Subscribe to a plan → Upload document →
  Configure (copies, color, sides, add-ons) →
    Select pickup slot → Submit order →
      Track status → Collect with pickup code
```

1. **Create an account** at `/register`
2. **Browse plans** at `/subscribe` and pick one (Starter/Pro/Premium)
3. **Upload a document** (PDF, DOCX, or PPTX) at `/upload`
4. **Configure** copies, B&W/color, single/double-sided, and add-ons (stapling, punching, binding)
5. **Pick a slot** — choose a date and predefined lab time window
6. **Submit** — the order is created and page balance is deducted
7. **Track** on the dashboard — watch the order move through SUBMITTED → ACCEPTED → PRINTING → READY
8. **Collect** — when READY, a pickup code is generated; show it at the print room

### Operator/Admin Workflow

```
Login at /admin → Dashboard → Manage orders →
  Update status → View users → Analytics → Settings
```

1. **Admin login** at `/admin/login` (separate from student auth)
2. **Dashboard** shows KPIs: active subscriptions, revenue, orders today/month, student count
3. **Orders page** lists all orders with search and filters (status, pickup slot)
4. **Advance orders** through the lifecycle with one click per stage
5. **Users page** shows all registered students with their active plans
6. **Plans page** — create, edit, or delete subscription plans
7. **Subscriptions page** — view active and expired subscriptions
8. **Analytics page** — revenue breakdown, profit margin, throughput stats
9. **Settings page** — configure page costs, add-on prices, file limits

### Order Lifecycle

```
SUBMITTED ──→ ACCEPTED ──→ PRINTING ──→ READY ──→ COLLECTED
                                 ↕
                             CANCELLED
```

Each transition is triggered by the admin from the orders table. When an order reaches **READY**, a unique pickup code is auto-generated.

### Subscription System

Plans are monthly recurring subscriptions with:
- A fixed number of **pages included** per month
- Optional **color printing** support (Premium tier)
- A **validity period** (30 days from purchase)
- Page **deduction** on each order submitted
- **Remaining pages** displayed on the student dashboard

---

## 2. Features

### Student Features

| Feature | Description |
|---|---|
| **Registration** | Email + password with name and phone |
| **Login** | Credentials-based auth with JWT sessions |
| **Subscription Plans** | Three tiers (Starter, Pro, Premium) with different page limits |
| **Document Upload** | Drag-and-drop upload for PDF, DOCX, PPTX (15 MB limit) |
| **Print Configuration** | Copies (1–10), B&W/Color, Single/Double-sided |
| **Add-ons** | Stapling, hole punching, file covers, folders |
| **Pickup Scheduling** | Date + predefined lab time slots |
| **Order Tracking** | Real-time status with visual progress indicators |
| **Dashboard** | Usage ring, queue summary, order history, pickup code display |
| **Payments** | Razorpay integration for plan purchases |

### Admin Features

| Feature | Description |
|---|---|
| **Admin Login** | Separate login at `/admin/login` with role check |
| **Dashboard** | KPI cards for revenue, orders, subscriptions, students |
| **Order Management** | Full list with search, status filter, slot filter |
| **Status Transitions** | One-click advancement through order lifecycle |
| **User Management** | Searchable student list with active plans |
| **Plan CRUD** | Create, edit, delete subscription plans |
| **Subscription View** | All subscriptions with usage and expiry tracking |
| **Analytics** | Revenue, cost, profit margin, throughput metrics |
| **System Settings** | Configure page costs, add-on prices, file limits |

---

## 3. Project Structure

```
printify/
├── prisma/                        # Database layer
│   ├── schema.prisma              # Models, enums, relations
│   ├── seed.ts                    # Default data (admin, plans, settings)
│   └── clear-data.ts              # Utility to delete all student data
│
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── globals.css            # Global styles + CSS variables (dark theme)
│   │   ├── layout.tsx             # Root layout (Providers, Toaster)
│   │   ├── page.tsx               # Landing page
│   │   │
│   │   ├── (auth)/                # Authentication routes
│   │   │   ├── layout.tsx         # Pass-through wrapper
│   │   │   ├── login/page.tsx     # Student login
│   │   │   └── register/page.tsx  # Student registration
│   │   │
│   │   ├── (dashboard)/           # Student dashboard routes
│   │   │   ├── layout.tsx         # Navbar wrapper
│   │   │   ├── dashboard/         # Main student dashboard
│   │   │   ├── upload/            # Upload + configure print job
│   │   │   └── subscribe/         # Plan listing + purchase
│   │   │
│   │   ├── (admin)/               # Admin routes
│   │   │   ├── layout.tsx         # Pass-through wrapper
│   │   │   └── admin/
│   │   │       ├── login/page.tsx # Admin login
│   │   │       └── (protected)/   # Auth-gated admin pages
│   │   │           ├── layout.tsx # Sidebar + role check
│   │   │           ├── AdminNav.tsx
│   │   │           ├── dashboard/
│   │   │           ├── orders/
│   │   │           ├── users/
│   │   │           ├── plans/
│   │   │           ├── subscriptions/
│   │   │           ├── analytics/
│   │   │           └── settings/
│   │   │
│   │   ├── api/                   # REST API routes
│   │   │   ├── auth/              # [...nextauth], register
│   │   │   ├── admin/settings     # Platform config CRUD
│   │   │   ├── upload/            # File upload handler
│   │   │   ├── plans/             # Plan CRUD
│   │   │   ├── subscriptions/     # Subscription management
│   │   │   ├── payments/          # Razorpay payment processing
│   │   │   └── orders/            # Order CRUD + status updates
│   │   │
│   │   └── uploads/               # Static file serving for uploads
│   │
│   ├── components/                # Reusable UI components
│   │   ├── Navbar.tsx             # Top navigation bar
│   │   ├── Select.tsx             # Custom dark-theme dropdown
│   │   └── PasswordInput.tsx      # Password field with visibility toggle
│   │
│   ├── lib/                       # Shared utilities
│   │   ├── auth.ts                # NextAuth config (credentials, JWT)
│   │   ├── auth-edge.ts           # Edge-runtime auth for middleware
│   │   ├── auth-guard.ts          # Server-side role guards
│   │   ├── prisma.ts              # Singleton Prisma client
│   │   ├── s3.ts                  # AWS S3 upload/delete helpers
│   │   ├── slots.ts               # Pickup slot configuration
│   │   └── validations.ts         # Zod schemas for all inputs
│   │
│   ├── types/
│   │   └── index.ts               # TypeScript types + NextAuth augmentation
│   │
│   └── middleware.ts              # Route protection (auth + role checks)
│
├── uploads/                       # Local file storage (dev fallback)
├── public/                        # Static assets
├── next.config.ts                 # Server actions body size limit (15 MB)
├── package.json
└── tsconfig.json
```

### Key Folders Explained

| Folder | Purpose |
|---|---|
| `src/app/(auth)` | Route group for login/register pages — no layout chrome besides the form |
| `src/app/(dashboard)` | Route group for student pages — wrapped in a navbar layout |
| `src/app/(admin)` | Route group for admin pages — `/admin/login` is unprotected, `/admin/(protected)` requires admin role |
| `src/app/api` | REST endpoints — each folder is a route with `route.ts` handling HTTP methods |
| `src/components` | Shared client components used across multiple pages |
| `src/lib` | Business logic, database client, auth config, validation schemas, utility functions |
| `prisma` | Database schema definition, migration files, seed script, and a custom clear-data script |

---

## 4. Environment Variables

### Complete Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string (Neon, RDS, or local) |
| `AUTH_SECRET` | Yes | Encryption secret for NextAuth JWT tokens |
| `NEXTAUTH_URL` | Yes | Canonical URL of your app (`http://localhost:4000` in dev) |
| `AWS_ACCESS_KEY_ID` | No | AWS access key for S3 file storage |
| `AWS_SECRET_ACCESS_KEY` | No | AWS secret key for S3 file storage |
| `AWS_REGION` | No | AWS region (e.g. `ap-south-1`) |
| `AWS_S3_BUCKET_UPLOADS` | No | S3 bucket name for uploaded files |
| `RAZORPAY_KEY_ID` | No | Razorpay API key ID |
| `RAZORPAY_KEY_SECRET` | No | Razorpay API key secret |
| `NEXT_PUBLIC_APP_URL` | Yes | Public URL of your app (`http://localhost:4000` in dev) |
| `RESEND_API_KEY` | No | Resend API key for email notifications |

### `.env` Template

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/printify?sslmode=require"

# NextAuth
AUTH_SECRET="generate-a-random-64-char-string"
NEXTAUTH_URL="http://localhost:4000"

# AWS S3 (optional — falls back to local uploads/)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="ap-south-1"
AWS_S3_BUCKET_UPLOADS="printify-uploads"

# Razorpay (optional — subscription creation works without it)
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""

# Resend (optional — email features)
RESEND_API_KEY=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:4000"
```

> **Note:** `AUTH_SECRET` should be a cryptographically random string. Generate one with: `openssl rand -base64 64`

---

## 5. Local Development Setup

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **PostgreSQL** database — use [Neon](https://neon.tech) (free tier) or a local instance
- **npm** or **pnpm**

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-org/printify.git
cd printify

# 2. Install dependencies
npm install

# 3. Copy environment file and fill in your values
cp .env.example .env
# Edit .env with your DATABASE_URL, AUTH_SECRET, etc.

# 4. Generate Prisma client and sync schema
npx prisma generate
npx prisma db push

# 5. Seed default data (admin account + plans + settings)
npm run db:seed

# 6. Start development server
npm run dev

# 7. Open in browser
open http://localhost:4000
```

### Default Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@printify.com` | `admin123` |
| Student | *(register at `/register`)* | — |

---

## 6. Database Setup

### Background

**PostgreSQL** is a powerful open-source relational database. Think of it as a set of spreadsheet tables that can talk to each other through relationships (foreign keys).

**Prisma** is an ORM (Object-Relational Mapper). It lets you define your database schema in a TypeScript-like file (`schema.prisma`) and generates a type-safe client so you never write raw SQL.

**Neon** is a serverless PostgreSQL provider with a generous free tier. It branches, scales to zero, and works with any PostgreSQL-compatible tool.

### Commands Reference

| Command | When to Use |
|---|---|
| `npx prisma generate` | After pulling changes, after installing, or after editing `schema.prisma`. Generates the Prisma Client from your schema. |
| `npx prisma db push` | During early development when you don't need migration history. Pushes schema changes directly to the database. |
| `npx prisma migrate dev` | After editing `schema.prisma` during development. Creates a new migration file and applies it. |
| `npx prisma migrate deploy` | In CI/CD or production. Applies pending migrations without creating new ones. |
| `npx prisma migrate status` | Shows which migrations have been applied and which are pending. |
| `npx prisma studio` | Opens a visual database browser at `http://localhost:5555`. Great for debugging. |
| `npm run db:seed` | Runs `prisma/seed.ts` to populate default admin, plans, and settings. |
| `npx tsx prisma/clear-data.ts` | Deletes all student users and their data (orders, subscriptions, uploads, payments, audit logs). Admin accounts, plans, and system settings are preserved. Tables and schema remain intact. |

### Typical Workflow

```bash
# First time setup
npx prisma generate
npx prisma db push
npm run db:seed

# After modifying schema.prisma
npx prisma migrate dev -m "describe your change"

# Before deploying to production
npx prisma migrate deploy
```

### Reset Database

```bash
# Drop all tables and re-run migrations (keeps schema)
npx prisma migrate reset --force

# Clear only student data while preserving admin accounts, plans, and settings.
# Deletes students, their orders, subscriptions, uploads, payments, and audit logs.
npx tsx prisma/clear-data.ts
```

---

## 7. Authentication Flow

### Registration

1. Student fills out the form at `/register` (name, email, phone, password)
2. Client sends `POST /api/auth/register` with the data
3. Server validates with `registerSchema` (Zod)
4. Password is hashed with `bcryptjs` (10 salt rounds)
5. User is created with `role: "student"`
6. Client calls `signIn("credentials")` to auto-login
7. On success, redirects to `/dashboard`

### Login

1. Student submits email + password at `/login`
2. `signIn("credentials")` sends a `POST` to NextAuth's credentials provider endpoint
3. Server looks up the user by email, compares password hash with `bcrypt.compare()`
4. If valid, NextAuth creates a **JWT** containing `id`, `name`, `email`, and `role`
5. The JWT is stored in an `httpOnly` cookie

### Session & JWT

- **Strategy:** `jwt` (no database sessions)
- **JWT Callback:** Adds `id` and `role` to the token during sign-in
- **Session Callback:** Maps `token.id` and `token.role` to `session.user`
- **Token refresh:** NextAuth handles automatic token refresh on each request

### Middleware Protection

The middleware (`src/middleware.ts`) runs on every page request:

```
Request → middleware.ts → auth() reads JWT cookie → check path + role → allow/redirect
```

| Route | Unauthenticated | Authenticated (student) | Authenticated (admin) |
|---|---|---|---|
| `/login` | Allow | Redirect to `/dashboard` | Redirect to `/admin/dashboard` |
| `/register` | Allow | Redirect to `/dashboard` | Redirect to `/admin/dashboard` |
| `/dashboard` | Redirect to `/login` | Allow | Redirect to `/admin/dashboard` |
| `/upload` | Redirect to `/login` | Allow | Redirect to `/admin/dashboard` |
| `/subscribe` | Redirect to `/login` | Allow | Redirect to `/admin/dashboard` |
| `/admin/login` | Allow | Redirect to `/dashboard` | Redirect to `/admin/dashboard` |
| `/admin/*` (other) | Redirect to `/admin/login` | Redirect to `/dashboard` | Allow |

### Role-Based Access

```typescript
// Server components use guard functions from auth-guard.ts
const session = await requireAdmin();  // redirects if not admin
const session = await requireStudent(); // redirects if not student
const session = await requireAuth();    // redirects if not logged in
```

On the client side, the middleware runs first as a gate, then server components re-verify the role.

---

## 8. Order Lifecycle

Each order passes through a defined sequence of statuses. The admin advances the order one step at a time.

```
                    ┌──────────┐
                    │SUBMITTED │  ← Student submits the order
                    └────┬─────┘
                         │ Admin clicks "Accept"
                    ┌────▼─────┐
                    │ ACCEPTED │  ← Admin reviews and accepts the job
                    └────┬─────┘
                         │ Admin clicks "Print"
                    ┌────▼─────┐
                    │ PRINTING │  ← Document is being printed
                    └────┬─────┘
                         │ Admin clicks "Ready"
                    ┌────▼─────┐
                    │  READY   │  ← Pickup code generated, student notified
                    └────┬─────┘
                         │ Admin clicks "Collect"
                    ┌────▼────────┐
                    │ COLLECTED   │  ← Student picked up the prints
                    └─────────────┘
```

| Status | Meaning | Action Required |
|---|---|---|
| **SUBMITTED** | Student has submitted the print order. File and config are visible to admin. | Admin reviews and accepts |
| **ACCEPTED** | Admin has accepted the job. Printing hasn't started yet. | Admin begins printing |
| **PRINTING** | Document is actively being printed. | Admin marks as ready |
| **READY** | Printing complete. A **pickup code** is auto-generated (e.g. `P-ABCD`). Student can collect from the print room. | Student collects |
| **COLLECTED** | Student has collected the prints. Order is complete. | — |
| **CANCELLED** | Order was cancelled before completion. | — |

Each status change timestamps the event (`acceptedAt`, `printingAt`, `readyAt`, `collectedAt`, `cancelledAt`) for audit purposes.

---

## 9. Subscription System

### Plans

Three tiers are seeded by default:

| Plan | Price (₹/mo) | Pages | Color | Validity |
|---|---|---|---|---|
| Starter | 249 | 50 | No | 30 days |
| Pro | 499 | 100 | No | 30 days |
| Premium | 749 | 100 | Yes | 30 days |

Admins can create, edit, or delete plans from the admin panel. Each plan has:
- `name`, `slug`, `description`
- `monthlyPrice` (in ₹, stored as integer paise-equivalent)
- `pagesIncluded` — max pages per billing cycle
- `supportsColor` — boolean flag for color printing eligibility
- `validityDays` — subscription duration (default 30)
- `active` — toggle to enable/disable the plan
- `displayOrder` — sort order on the subscribe page

### How Subscriptions Work

1. Student picks a plan at `/subscribe`
2. If the plan costs ₹0 or Razorpay is not configured, the subscription activates immediately
3. Otherwise, the student completes payment through Razorpay, and the subscription activates on payment confirmation
4. On activation:
   - Any existing active subscription is cancelled
   - A new `Subscription` record is created with:
     - `pagesAllowed = plan.pagesIncluded`
     - `pagesUsed = 0`
     - `startDate = now`
     - `expiryDate = now + validityDays`
5. When the student submits a print order, `pagesUsed` increments by `pages × copies`
6. The student dashboard shows a circular usage indicator and the remaining page count
7. Expired subscriptions show as inactive — the student must purchase a new plan

### Page Balance Check

Before an order is accepted, the system verifies:

```
remainingPages = pagesAllowed - pagesUsed
if (pages × copies > remainingPages) → reject order
```

---

## 10. File Upload Flow

### Step-by-Step

```
1. Student uploads a file at /upload
       │
2. Client sends multipart/form-data POST /api/upload
       │
3. Server validates:
   - File type: .pdf, .docx, .pptx only
   - File size: ≤ 15 MB
       │
4. File saved to local uploads/ directory
   (or S3 if AWS credentials are configured)
       │
5. For PDFs, server extracts page count via pdf-parse
       │
6. Returns file metadata: fileName, filePath, fileSize, pages
       │
7. Student configures: copies, mode, sides, add-ons, pickup slot
       │
8. Client submits POST /api/orders with full order payload
       │
9. Server verifies:
   - Active subscription exists
   - Color mode allowed by plan
   - Page balance sufficient (pages × copies ≤ remainingPages)
   - Pickup slot is valid (predefined slots only)
       │
10. Order created with status SUBMITTED
    Subscription pagesUsed incremented
       │
11. Admin sees the order, advances through lifecycle
       │
12. When READY → Pickup code auto-generated
    Student collects with the code
```

### Storage

- **Default:** Files are saved to the local `uploads/` directory
- **Production:** When `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set, files are uploaded to S3 via the `@aws-sdk/client-s3` SDK
- Files are served statically via the `src/app/uploads/[...path]/route.ts` catch-all route

---

## 11. Deployment Guide

### Deploy to Vercel

```bash
# 1. Install Vercel CLI (or use the Vercel dashboard)
npm i -g vercel

# 2. Build for production
npm run build

# 3. Deploy
vercel --prod
```

### Production Checklist

1. **Database** — Set up a Neon PostgreSQL database (free tier works)
2. **Environment Variables** — Configure all variables in Vercel dashboard
3. **Migrations** — Run before your first deployment:
   ```bash
   npx prisma migrate deploy
   ```
4. **Seed** — Run once to create the admin account:
   ```bash
   npx tsx prisma/seed.ts
   ```
5. **AUTH_SECRET** — Generate a strong random secret:
   ```bash
   openssl rand -base64 64
   ```
6. **Upload directory** — On Vercel, the local `uploads/` directory is ephemeral. Configure AWS S3 for persistent file storage.

### Build Commands

```bash
# Development
npm run dev          # Starts Next.js dev server on :4000

# Production build
npm run build        # Generates Prisma client + builds Next.js

# Production serve
npm run start        # Starts production server on :4000

# Type checking
npm run typecheck    # Runs tsc --noEmit

# Linting
npm run lint         # Runs next lint
```

---

## 12. Common Errors & Fixes

### Prisma: P1001 — Cannot reach database server

**Error:** Can't reach database server

**Cause:** Wrong `DATABASE_URL`, database server is down, or network issue.

**Fix:**
- Verify `DATABASE_URL` in `.env` is correct
- Check if your IP is allowlisted in Neon's dashboard
- Test connection: `npx prisma db push`

### Prisma: P2021 — Table does not exist

**Error:** The table `public.User` does not exist

**Cause:** Schema hasn't been pushed or migrations haven't run.

**Fix:**
```bash
npx prisma db push
# or if using migrations:
npx prisma migrate deploy
```

### JWTSessionError — No matching decryption secret

**Error:** `JWTSessionError: no matching decryption secret`

**Cause:** `AUTH_SECRET` has changed since the JWT was issued, or is not set at all.

**Fix:**
- Ensure `AUTH_SECRET` is set in `.env` and hasn't changed
- Clear browser cookies and re-login
- If rotating secrets, see NextAuth guide on secret rotation

### EPERM — query_engine.dll

**Error:** `EPERM operation not permitted` or `query_engine.dll` errors on Windows

**Cause:** Prisma engine binary locked by another process.

**Fix:**
```bash
npx prisma generate
# If that fails, restart your terminal and try again
```

### 404 Errors on Page Refresh

**Error:** 404 when navigating directly to a route (e.g. `/dashboard`)

**Cause:** Usually a missing `page.tsx` or an incorrect route group structure.

**Fix:**
- Verify the file exists at the expected path
- Check that route group folders use parentheses: `(dashboard)`, not `dashboard`
- Ensure each route segment has a `page.tsx`

### Auth Redirect Loops

**Error:** Browser jumps between `/admin/dashboard` and `/dashboard` endlessly.

**Cause:** The middleware (using `auth-edge.ts`) doesn't have the `jwt`/`session` callbacks, so `session.user.role` is `undefined`. The middleware redirects non-admin roles to `/dashboard`, and the dashboard server component redirects non-student roles back to `/admin/dashboard`.

**Fix:** Ensure `src/lib/auth-edge.ts` includes the same `jwt` and `session` callbacks as `src/lib/auth.ts`:

```typescript
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id;
      token.role = (user as any).role;
    }
    return token;
  },
  async session({ session, token }) {
    if (session.user) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
    }
    return session;
  },
},
```

### Dropdown Styling Issues

**Error:** Native `<select>` dropdown options show white background with light text (unreadable in dark mode).

**Cause:** Native `<option>` elements are rendered by the OS/browser — CSS cannot style them. The `color-scheme: dark` CSS property is inconsistently supported.

**Fix:** The project uses a custom `<Select>` component (`src/components/Select.tsx`) that renders a styled button + dropdown list instead of a native `<select>`. All dropdowns in the app now use this component.

---

## 13. Future Roadmap

| Feature | Status | Description |
|---|---|---|
| **Email Notifications** | Planned | Notify students when order is READY via Resend |
| **SMS Updates** | Planned | WhatsApp/SMS integration for pickup alerts |
| **Coupon System** | Planned | Discount codes for plan purchases |
| **Referral Program** | Planned | Refer-a-friend credits for both parties |
| **Advanced Analytics** | Planned | Charts, trends, exportable reports |
| **Multi-Campus** | Planned | Separate print rooms per campus location |
| **Mobile App** | Long-term | React Native companion app for students |
| **Auto Page Reset** | Planned | Automatic monthly page allowance reset |
| **Print Queue Display** | Planned | Live TV-style display in print room showing queue |

---

## 14. Contributing

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make your changes
4. Run `npm run typecheck` — ensure zero TypeScript errors
5. Run `npm run build` — ensure the project builds
6. Push and open a Pull Request

### Code Conventions

- **Components:** Use `"use client"` for interactive components, server components by default
- **API Routes:** Validate all inputs with Zod schemas from `src/lib/validations.ts`
- **Styling:** Use the CSS variable system in `globals.css`. Use `glass-card`, `form-input`, `btn`, and other utility classes.
- **State:** Use string state for form inputs (never `Number(e.target.value)` on keystroke)
- **Database:** All Prisma operations go through the singleton client in `src/lib/prisma.ts`

### Before Submitting

- Check that all existing functionality still works
- Verify dark theme consistency for any new UI
- Ensure new API routes check authentication and authorization
- Add appropriate Zod validation for any new inputs

---

## 15. License

MIT License

Copyright (c) 2026 Printify

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
