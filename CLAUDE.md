@AGENTS.md

# G1 Dashboard

Web dashboard for managing a Unitree G1 humanoid robot — auth, RBAC, personas, RAG document
management, MCP integrations, wake-word training, gesture control, and live chat simulation.
Next.js 16 (App Router) + React 19 + TypeScript, Tailwind v4, shadcn/ui.

## Commands

```bash
npm run dev            # dev server, bound to 0.0.0.0 (accessible over LAN)
npm run build           # production build
npm run start            # production server, bound to 0.0.0.0
npm run lint             # eslint
npm run mqtt:listen      # run scripts/mqtt-listener.ts standalone (ts-node, CJS)
npm run db:migrate       # prisma migrate dev
npm run db:seed          # prisma db seed
npm run db:reset         # prisma migrate reset --force
```

Playwright tests live in `tests/` (`chat.spec.ts`, `mcp.spec.ts`, `rag.spec.ts`,
`workflow.spec.ts`, `global.setup.ts`). Config in `playwright/` — no `npm test` script exists,
invoke `npx playwright test` directly.

## Architecture

### Feature-module pattern (`app/features/*`)

Almost all product functionality lives under `app/features/<name>/`, each shaped the same way:

```
app/features/<name>/
  index.tsx        # the feature module's public entry point
  api.ts            # backend calls for this feature (thin wrapper over lib/api.ts's ApiClient)
  hooks.ts / hooks/ # feature-scoped React hooks (useXState, useXActions, ...)
  types.ts          # feature-scoped types
  components/       # feature-scoped components, not shared elsewhere
```

Routes under `app/<route>/page.tsx` are thin — they import and render a feature module rather
than containing logic themselves. When adding a new feature, follow this shape rather than
putting logic directly in `app/<route>/page.tsx` or in `components/`.

`components/` (top-level) holds cross-feature shared UI: shadcn primitives (`components/ui/`),
landing-page sections, and app chrome (sidebar, header, feature gating). `app/components/` holds
UI that's shared across authenticated app routes but isn't a shadcn primitive (limelight-nav,
feature-gate, features-context, auth-guard, 404 experience). If a component is used by more than
one feature, it belongs in one of these two places, not duplicated into a feature's own
`components/`.

### Auth & sessions

- `lib/auth.ts` — PASETO v3.local encrypted session tokens (not JWT). Requires
  `PASETO_SECRET_KEY` env var: a 64-char hex string (32 bytes). Session cookie name is
  `g1_session`, 8h expiry. `createToken`/`verifyToken`/`createSessionCookie`/`clearSessionCookie`
  live here.
- `lib/roles.ts` — role checks (`getUserRole`, `isSuperAdmin`, `isClient`, `isViewer`, ...) built
  on top of `lib/auth.ts`. `UserRole` is defined in `lib/mock-db.ts`.
- `app/components/auth-guard.tsx` — client-side route protection; `PublicRoutes` lists routes
  that skip the guard.
- Auth API routes: `app/api/auth/{login,logout,me,change-password}/route.ts`.
- There is no `middleware.ts` — auth is enforced per-route (via `AuthGuard` and/or server-side
  session checks), not centrally.

### Feature flags (RBAC-driven, not env-driven)

- `app/components/features-context.tsx` — `FeaturesProvider`/`useFeatures()`; feature
  availability comes from the tenant's enabled-features map, not build-time flags.
- `app/components/feature-gate.tsx` — `<FeatureGate featureKey="...">` wraps UI that should be
  hidden or click-intercepted (with a disclaimer) when a feature is disabled for the tenant.
  This is the widest cross-community bridge in the codebase's dependency graph — most feature
  modules import it. When adding a gated feature, register its key in the features context
  rather than checking flags ad hoc.

### Data layer

- `lib/api.ts` — `ApiClient` class, the single HTTP client for all backend calls (token stored
  in `localStorage`, attached as a bearer header). Feature `api.ts` files call through this
  rather than using `fetch` directly.
- `lib/mock-db.ts` — mock/in-memory data store and shared types (`UserRole`, etc.) used before
  Prisma is fully wired up. `prisma.config.ts` points at `prisma/schema.prisma`, but no
  `prisma/` directory exists yet in this checkout — treat Prisma as configured-but-not-active
  and confirm before assuming `db:migrate`/`db:seed` will work.
- `lib/mqtt.ts` + `scripts/mqtt-listener.ts` — MQTT client for robot event ingestion; the
  listener script runs standalone via `npm run mqtt:listen`, separate from the Next.js process.
- `lib/eventEmitter.ts` — process-wide event bus (`EventBus`) for cross-module notifications
  server-side.

### Styling

Tailwind v4 with shadcn/ui (`components.json`: style `base-nova`, base color `neutral`, RSC
enabled). Use the `@/*` path alias (maps to project root, per `tsconfig.json`) — e.g.
`@/lib/api`, `@/components/ui/button`, `@/app/features/rag`. `cn()` (from `lib/utils.ts`) is the
shared `clsx` + `tailwind-merge` helper used throughout for conditional classNames.

## Before writing code

This project pins a Next.js version with breaking changes from the Next.js in your training
data — **read `AGENTS.md` first** (imported at the top of this file), and consult
`node_modules/next/dist/docs/` for anything App Router or API related before assuming
conventions from memory.

## Notes for future edits

- `app/features/*/api.ts`, `hooks.ts`, and `types.ts` are frequently one-line re-export stubs for
  features that are still scaffolded but not fully built out (e.g. `communication-gestures`,
  `emotions`, `feature-suggestions`, `ota-updates`, `rbac`, `voice-settings`). Check whether a
  feature is a real implementation or a stub before extending it.
- `graphify-out/` (knowledge-graph tooling output) is git-ignorable scratch content, not part of
  the app.
