---
"non-spooky-react-cookie": patch
---

`non-spooky-react-cookie/server` now resolves in tools that ignore the `exports` field (old Jest, webpack 4, TypeScript `moduleResolution: node`). A `server/package.json` stub in the tarball points them at the built files.
