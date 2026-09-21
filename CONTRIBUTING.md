# Contributing

Thanks for helping make cookie consent less spooky.

## Setup

```bash
pnpm install
pnpm example        # runs the Vite playground with live reload of src/
```

Node 18+ and pnpm 11 (the version is pinned in `package.json` → `packageManager`; run `corepack enable` if pnpm is missing).

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm build` | Bundles `src/` to `dist/` (ESM + CJS + `.d.ts`) and copies `styles.css` |
| `pnpm dev` | Same, in watch mode |
| `pnpm example` | Vite playground at http://localhost:5173 |
| `pnpm lint` / `pnpm lint:fix` | Biome lint + format check / auto-fix |
| `pnpm typecheck` | `tsc --noEmit` for the library and the playground |
| `pnpm test` | Vitest unit tests |
| `pnpm check` | Everything CI runs, in order |
| `pnpm changeset` | Adds a release note for your change |

## Pull requests

1. Branch from `main`.
2. Make the change. Add or adjust a scenario in `examples/vite-playground/src/scenarios/` if it is user-visible.
3. Run `pnpm check`.
4. If the published package changes, run `pnpm changeset` and pick `patch`, `minor` or `major` (see `MAINTAINING.md` for how to choose).
5. Open the PR. CI must be green.

## Code style

Biome owns formatting and linting; do not hand-format. Components use plain CSS classes prefixed `nsr-` and CSS custom properties prefixed `--nsr-`. No Tailwind or other CSS framework may be required at runtime.
