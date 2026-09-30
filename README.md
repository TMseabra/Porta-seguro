# PortãoSeguro

A school entry/exit logging system: students identify themselves at the gate with a short-lived QR code, and the system decides — automatically, from the class schedule — whether that entry or exit is on time, late, or needs a parent's confirmation. Built as the final project for **UFCD 10790 (Programming Project)**, a 3rd-year vocational Computer Programming course in Portugal.

## What it does

- **QR-based check-in/out.** Each student generates a one-time QR code from their phone (valid for 1 minute, single use, locked to either an entry or an exit). The gate keeper scans it, confirms the student's identity against their photo, and the system logs the movement.
- **Schedule-aware decisions.** Whether an arrival counts as "on time" or "late", and whether a student is even allowed to leave, is derived from the class timetable — never entered by hand.
- **Parental confirmation for early exits.** If a student tries to leave in the middle of a class and isn't of legal age (or doesn't have standing parental authorization), the gate keeper is prompted to call the parents before the exit is logged.
- **Role-based views**, each seeing only what they need:

  | Role | Can do |
  |---|---|
  | Student | Generate their QR code, view their own weekly schedule, check their own attendance record |
  | Gate keeper (*porteiro*) | Scan QR codes, confirm identity, log movements |
  | Teacher | View their own classes only (not the full class schedule) |
  | Homeroom teacher (*DT*) | Same as teacher, for their assigned class |
  | Coordinator | Query attendance/lateness reports for the courses they coordinate |
  | Manager (*gestor*) | Everything admin can do — manage students, classes, courses, import timetables from Excel — **except** the test gate console |
  | Admin | Full access, including the test gate console used to demo/verify the check-in flow without a physical camera |
- **Excel timetable import.** Whoever builds the class timetables works in Excel; upload the file, preview what the system understood (with per-row validation errors), and publish it to a class in one step.
- **Attendance reports**, exportable as PDF, always computed live from logged movements + the timetable — never stored as a separate, hand-editable number.

## Security

This was hardened well beyond what the original assignment asked for:

- **Argon2id** password hashing (OWASP-recommended parameters, not the library defaults left implicit).
- **Opaque, single-use QR tokens** — the code itself carries no data, just a random 24-byte lookup key; who/when/how a movement is logged is always resolved server-side from that key, never trusted from the client.
- **Login rate limiting** (5 attempts per account / 15 minutes), checked *before* hashing — so a flood of attempts can't be used to exhaust server memory via Argon2id.
- **Email-based two-factor authentication** for admin and manager accounts (the two roles with power over everyone else's data), with a 6-digit code, 10-minute expiry, single use, and 3 attempts before it's invalidated.
- **Automatic session expiry at midnight** for admin/manager sessions, regardless of the general 8-hour session length — a forgotten open tab on a school computer stops working at the end of the day.
- **Login alerts by email** for every elevated-privilege sign-in, with timestamp and IP.
- **Content-Security-Policy**, strict-scoped MongoDB queries, server-side permission checks on every mutation (never inferred from what the UI happens to show), and IDOR protection on every report/query endpoint.

## Tech stack

- **Next.js 16** (App Router, Server Actions) + **React 19** + **TypeScript**
- **MongoDB Atlas** + **Mongoose**
- **Auth.js v5** — credentials + Google sign-in
- **@node-rs/argon2** for password hashing
- **Tailwind CSS v4**, with a full dark mode
- **html5-qrcode** (camera-based QR scanning) / **qrcode** (QR generation)
- **SheetJS (xlsx)** for the Excel timetable importer
- **pdf-lib** for attendance report PDFs
- **Resend** for transactional email (login alerts, 2FA codes)
- **Vitest** for the business-rules test suite

## Getting started

**Prerequisites:** Node.js 20+, a MongoDB Atlas cluster (a free M0 tier is enough).

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template and fill it in — every variable is documented inline with where to get its value:

   ```bash
   cp .env.example .env.local
   ```

3. (Optional, but recommended for a first run) Seed the database with demo data — two courses, four classes, ~20 students, a full week of timetables, and one account per role:

   ```bash
   npm run seed
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm test` | Run the Vitest suite |
| `npm run seed` | Populate the database with demo data |

## Project structure

```
src/
  app/
    admin/          Admin & manager area (students, classes, courses, timetable import)
    area-pessoal/   Student's personal area (QR code, schedule, attendance)
    consultas/      Attendance queries & PDF export (coordinator/manager/admin)
    horarios/       Timetable views (teacher / homeroom teacher)
    login/          Sign-in (credentials, Google, 2FA)
    painel/         Landing page after sign-in, role-aware shortcuts
    portao-teste/   Real gate console (QR scan + identity confirmation)
    portaria/       Gate keeper's daily log
  components/       Shared UI (schedule grid, custom dropdown, identification cards)
  lib/
    regras/         Pure, unit-tested business rules (entry/exit decisions, QR validation, ...)
    relatorios/     Attendance calculation
    ...             Auth, database connection, email, timezone handling, permissions
  models/           Mongoose schemas
scripts/
  seed.ts           Demo data generator
```

## Testing

The business rules that decide entries, exits, lateness, suspensions, and QR validity live in `src/lib/regras/` as pure functions (no database, no network) with a Vitest suite covering the edge cases — exact block boundaries, expiry down to the minute, etc.

```bash
npm test
```

## Deployment

Deployed on **Vercel**, connected to this repository. Environment variables are configured in the Vercel project settings, mirroring `.env.example`.
