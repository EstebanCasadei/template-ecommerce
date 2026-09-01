# Agents

## Agent skills

### Issue tracker

Issues are tracked in the repo's GitHub Issues using the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Domain docs

This repo uses a single-context layout with a root `CONTEXT.md` and `docs/adr/`. See `docs/agents/domain.md`.

## Build and verification commands

- **Frontend**: `pnpm install` → `pnpm run lint` → `pnpm run build`
- **Cloud Functions**: `cd functions && pnpm install` → `pnpm run lint`
- **Admin claim**: `node scripts/set-admin.js <email> [--remove]` (requires
  `serviceAccountKey.json` and `firebase-admin` in root devDependencies).
- **Seed sample catalog**: `pnpm run seed` (or `pnpm run seed:force` to overwrite).
- **Firestore Rules**: deploy with `firebase deploy --only firestore`.

## Bundle notes

- Vite is configured to split `firebase`, `vendor` (React + Router), and the
  lazy-loaded `AdminRoutes` chunk. The Firebase chunk is large by design and the
  warning limit is raised to 600 kB to keep the build output clean.
