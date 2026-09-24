# server/

This directory is not an application — it's a subpath-export resolution shim.

`non-spooky-react-cookie` ships a separate server-only entry point (for reading
cookie consent during SSR, e.g. in Next.js). Modern bundlers resolve
`non-spooky-react-cookie/server` via the `exports` field in the root
[`package.json`](../package.json). Tools that don't support `exports` instead
look for a real `server/package.json` on disk, so this folder exists to satisfy
that legacy resolution path.

`package.json` here just points at the built output:

```json
{
  "main": "../dist/server.cjs",
  "module": "../dist/server.js",
  "types": "../dist/server.d.ts"
}
```

It's listed in the root package's `files` array so it ships in the published
npm tarball alongside `dist/`. This `package.json` is hand-written, not
emitted by `tsdown`, and should stay in sync with the `"./server"` entry in
the root `exports` map.
