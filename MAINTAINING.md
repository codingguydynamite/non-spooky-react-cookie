# Maintaining and releasing non-spooky-react-cookie

This is the how-to for whoever owns the package. It covers the toolchain, the day-to-day flow, how a release actually happens, the one-time setup, and what to do when something breaks.

## 1. The toolchain in one screen

| Tool | Job | Config |
| --- | --- | --- |
| pnpm 11 | Installs, runs scripts, links `examples/vite-playground` as a workspace | `pnpm-workspace.yaml`, `packageManager` in `package.json` |
| tsdown | Bundles `src/` to `dist/` as ESM + CJS with `.d.ts`, copies `styles.css`, runs publint | `tsdown.config.ts` |
| Biome | Formatter and linter in one. Replaces ESLint + Prettier | `biome.json` |
| Vitest | Unit tests for the pure modules under `tests/` | `vitest.config.ts` |
| Changesets | Turns per-PR release notes into version bumps, a CHANGELOG and npm publishes | `.changeset/config.json` |
| GitHub Actions | `ci.yml` checks every PR; `release.yml` versions and publishes from `main` | `.github/workflows/` |
| publint + attw | Sanity-check the package shape and types after every build | `pnpm check:package` |

Scripts you will actually type:

```bash
pnpm check          # lint + typecheck + test + build + package check. Same as CI.
pnpm example        # playground with live reload of src/
pnpm changeset      # add a release note for the change you just made
pnpm lint:fix       # let Biome fix formatting and safe lint issues
```

## 2. Day-to-day: shipping a change

1. Branch off `main`.
2. Make the change. If it is user-visible, add or update a scenario in `examples/vite-playground/src/scenarios/` and the README.
3. Run `pnpm check`.
4. Run `pnpm changeset`. It asks two things:
   - Which bump: `patch`, `minor` or `major` (see the table below).
   - A summary. Write it for the CHANGELOG reader, one or two sentences, present tense: "Adds `dialogProps` to `CookieBanner`."
   It writes a small markdown file into `.changeset/`. Commit it with your change.
5. Open a PR. CI runs Biome, tsc, Vitest, the library build, publint/attw and the playground build. Merge when green.

Changes that do not touch the published package (docs, playground only, CI) need no changeset.

### Choosing the bump

| Bump | When | Examples from this API |
| --- | --- | --- |
| `patch` | Bug fix, no API change | `cleanup` fired for scripts that never loaded; dark-mode color wrong |
| `minor` | New feature, backwards compatible | New provider prop; new `--nsr-*` variable; new language |
| `major` | Anything an existing user must change code for | Renaming a class in `styles.css`; removing an export; changing the stored JSON shape; raising the React peer range |

The CSS class names and custom properties are public API. Renaming `nsr-banner__card` is a `major`.

## 3. How a release happens

Nothing publishes on merge of a feature PR. Instead:

1. You merge a PR that contains a changeset into `main`.
2. `release.yml` runs, sees pending changesets, and opens (or updates) a PR titled **chore: release**. That PR deletes the changeset files, bumps `version` in `package.json`, and prepends the notes to `CHANGELOG.md`. Several merged changesets accumulate into the same PR.
3. When you are ready to ship, merge **chore: release**.
4. `release.yml` runs again, finds no pending changesets and a version that is not on npm yet, runs `pnpm release` (`pnpm build && changeset publish`), pushes the git tag `v1.2.3`, and creates a GitHub release with the CHANGELOG section. `changesets/action` v2 pushes the release commit and the tag through the GitHub API, so both are signed by GitHub and attributed to `github-actions[bot]`.
5. Publishing authenticates through **npm trusted publishing** (OIDC): GitHub proves to npm that the workflow ran from this repository and npm issues a short-lived token. There is no `NPM_TOKEN` secret to rotate or leak.
6. npm adds a **provenance attestation** only when both the package and the source repository are public. The repository is private right now, so releases publish fine but without the "Provenance" badge. Make the repository public to get it; nothing in the workflow has to change.

Check the result on `https://www.npmjs.com/package/non-spooky-react-cookie`: version, README, and (public repository only) the "Provenance" badge.

## 4. One-time setup (do these once, in order)

### 4.1 GitHub repository

```bash
gh repo create non-spooky-react-cookie --public --source . --push
```

Then in the repository settings:

- **Settings → Actions → General → Workflow permissions**: enable **Allow GitHub Actions to create and approve pull requests**. Without it the release workflow cannot open the "chore: release" PR and fails with "Resource not accessible by integration". As of 2026-09-22 this is still **off** for `codingguydynamite/non-spooky-react-cookie`. Flip it in the UI or with:

  ```bash
  gh api -X PUT repos/codingguydynamite/non-spooky-react-cookie/actions/permissions/workflow \
    -f default_workflow_permissions=read -F can_approve_pull_request_reviews=true
  ```

- Optionally **Settings → Branches**: protect `main`, require the `CI` check.
- The `repository`, `homepage` and `bugs` URLs in `package.json` must point at the repository the workflow actually runs in (`codingguydynamite/non-spooky-react-cookie`). With provenance enabled npm rejects the publish (E422) when `repository.url` does not match the repository in the OIDC token, and the comparison is case-sensitive.

### 4.2 npm account

- Create an account on npmjs.com and enable 2FA.
- The package name `non-spooky-react-cookie` was free as of 2026-09-16. Publishing claims it.

### 4.3 First publish is manual

Trusted publishing is configured per package, and the package must exist first. So the very first version is published from your machine (as of 2026-09-22 the package is not on npm yet, so this step is still ahead of you):

```bash
npm login
pnpm check           # everything green
pnpm release         # builds and runs `changeset publish` with --access public
git push --follow-tags
```

### 4.4 Configure the trusted publisher

On npmjs.com open the package → **Settings** → **Trusted publisher** → **GitHub Actions**:

| Field | Value |
| --- | --- |
| Organization or user | `codingguydynamite` (the GitHub owner the workflow runs under, not the npm user) |
| Repository | `non-spooky-react-cookie` |
| Workflow filename | `release.yml` |
| Environment | leave empty |

All four fields are compared case-sensitively against the OIDC token, including the `.yml` extension. The same thing from the terminal, with npm 11.5.1 or newer:

```bash
npm trust github non-spooky-react-cookie --repo codingguydynamite/non-spooky-react-cookie --file release.yml --allow-publish
```

Then, under **Publishing access**, choose **Require two-factor authentication and disallow tokens**, which still allows trusted publishing. From now on merging "chore: release" publishes.

## 5. Checking the artifact before a release

CI already builds and runs publint and attw. When you want to hold the tarball in your hands:

```bash
pnpm build
pnpm pack                     # writes non-spooky-react-cookie-<version>.tgz
tar -tzf non-spooky-react-cookie-*.tgz   # what would be published
```

Install it into a real app (the `handwerk-portfolio` Next.js app is a good smoke test):

```bash
cd ../../handwerk-portfolio
npm install ../packages/non-spooky-react-cookie/non-spooky-react-cookie-<version>.tgz
# add: import "non-spooky-react-cookie/styles.css" to app/layout.tsx
npm run build
```

What the two validators mean:

- **publint** checks `package.json` against the files on disk: every `exports` target exists, `types` come before `default`, `files` is sane.
- **attw** ("Are the types wrong?") resolves the package the way four different TypeScript configurations would (`node10`, `node16` CJS and ESM, `bundler`). All cells must be green. A `💀 Resolution failed` on a subpath usually means a missing `typesVersions` entry or a wrong `exports` key.

## 6. Less common tasks

**Pre-release (beta) line.** `pnpm changeset pre enter beta`, commit, merge. Every release from now on is `1.1.0-beta.0`, `1.1.0-beta.1`, … published under the `beta` dist-tag. `pnpm changeset pre exit`, commit, merge to go back to normal releases.

**Hotfix an old major.** Branch from the tag (`git checkout -b 1.x v1.4.2`), fix, add a changeset, and run `pnpm release` locally. The automated workflow only watches `main`.

**Deprecate a broken version.** `npm deprecate non-spooky-react-cookie@1.2.0 "Use 1.2.1, fixes the settings dialog crash"`. Existing installs keep working; new installs see the warning.

**Unpublish.** Only within 72 hours and only if no other package depends on it (`npm unpublish non-spooky-react-cookie@1.2.0`). Prefer deprecating plus a patch release.

**Bump the React peer range.** That is a `major`. Update `peerDependencies`, the playground, and the README "Install" section together.

**Update tooling.** Dependabot opens weekly PRs: one grouped PR for dev dependencies and one PR per GitHub Action (`.github/dependabot.yml` only groups the npm ecosystem). Biome updates may reformat code; run `pnpm lint:fix` and commit the result in the same PR. Actions are pinned to a major tag (`@v7`); when Dependabot bumps a major, read that action's release notes before merging, because inputs get renamed or removed. `changesets/action` is pinned to `@v2`, whose inputs are kebab-case (`publish-script`, `pr-title`, `commit-message`, `create-github-releases`); the v1 names fail the step. GitHub moves `ubuntu-latest` to Ubuntu 26 from 2026-10-19; pin `runs-on: ubuntu-24.04` if a release breaks after that.

## 7. Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| No "chore: release" PR appears after merging a changeset, or the step fails with "Resource not accessible by integration" | Actions may not create PRs | Enable the setting in 4.1 |
| Release step fails with "Unexpected input(s) 'publish', 'title', 'commit', 'createGithubReleases'" or "The following inputs have been renamed" | `changesets/action@v2` uses kebab-case inputs | Use `publish-script`, `pr-title`, `commit-message`, `create-github-releases`; drop any `GITHUB_TOKEN` env on that step, v2 reads the `github-token` input |
| Publish fails with E422 mentioning provenance and `repository.url` | `package.json` `repository.url` does not match the GitHub repo the workflow ran in | Point it at `git+https://github.com/codingguydynamite/non-spooky-react-cookie.git`, exact casing |
| Published fine but no "Provenance" badge on npm | Source repository is private | Expected. Make the repository public if you want provenance |
| Publish step fails with 404 / E403 / "unable to authenticate" | Trusted publisher not configured, or repo/workflow name differs | Compare 4.4 with the actual repository and workflow filename, exactly |
| Publish fails with "npm >= 11.5.1 required" | Old npm on the runner | `release.yml` runs `npm install -g npm@latest`; make sure that step is still there |
| CI fails on `pnpm install --frozen-lockfile` | `package.json` changed without updating `pnpm-lock.yaml` | Run `pnpm install` locally and commit the lockfile |
| CI fails in "Lint and format" but `pnpm lint` passes locally | Local Biome version differs from the one in the lockfile | Use `pnpm exec biome`, not a global install |
| attw shows `False ESM` or `Masquerading as CJS` | `types` condition points at the wrong extension | The `import` branch must use `.d.ts`, the `require` branch `.d.cts` |
| Playground builds in dev but `pnpm example:build` fails | Dev uses `src/` via alias, build uses `dist/` | Run `pnpm build` first; check the `exports` map covers what the playground imports |
| Consumers see unstyled components | They did not import the stylesheet | Point them at `import "non-spooky-react-cookie/styles.css"` |
