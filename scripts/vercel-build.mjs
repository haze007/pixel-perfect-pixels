#!/usr/bin/env node
/**
 * Vercel Build Output API v3 adapter for TanStack Start.
 *
 * Produces the .vercel/output/ directory structure that Vercel reads natively:
 *   .vercel/output/static/          ← CDN-served client assets
 *   .vercel/output/functions/       ← Serverless function (Node.js)
 *   .vercel/output/config.json      ← Route rules
 *
 * Run via: node scripts/vercel-build.mjs
 */

import { execSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  writeFileSync,
  rmSync,
  existsSync,
} from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const out  = join(root, ".vercel", "output");

/* ── 1. Clean & build ─────────────────────────────────────────────── */

console.log("▶ Building TanStack Start…");
execSync("npm run build", { stdio: "inherit", cwd: root });

/* ── 2. Clean previous Vercel output ─────────────────────────────── */

if (existsSync(out)) rmSync(out, { recursive: true, force: true });

/* ── 3. Copy client assets → .vercel/output/static/ ─────────────── */

console.log("▶ Copying static assets…");
const staticDir = join(out, "static");
mkdirSync(staticDir, { recursive: true });
cpSync(join(root, "dist", "client", "assets"), join(staticDir, "assets"), { recursive: true });
cpSync(join(root, "dist", "client", "favicon.svg"), join(staticDir, "favicon.svg"));

/* ── 4. Create the SSR serverless function ────────────────────────── */

console.log("▶ Creating serverless function…");
const fnDir = join(out, "functions", "_render.func");
mkdirSync(fnDir, { recursive: true });

// Copy the entire server bundle (server.js + assets/ chunks)
cpSync(join(root, "dist", "server"), fnDir, { recursive: true });

// Function entry point: adapts TanStack Start's Web-Fetch handler → Node.js handler
writeFileSync(
  join(fnDir, "index.mjs"),
  `/**
 * Vercel Node.js serverless function entry.
 * Converts TanStack Start's Web Fetch handler → Node.js (req, res).
 */
import { toNodeHandler, fromWebHandler } from "h3-v2";
import server from "./server.js";

// h3-v2: fromWebHandler wraps a (Request → Response) as an H3 event handler
//        toNodeHandler converts that to (IncomingMessage, ServerResponse)
const handler = toNodeHandler(fromWebHandler(server.fetch));
export default handler;
`,
);

// package.json — mark as ESM so Node.js handles bare import extensions
writeFileSync(
  join(fnDir, "package.json"),
  JSON.stringify({ type: "module" }, null, 2),
);

// .vc-config.json — Vercel Build Output API metadata
writeFileSync(
  join(fnDir, ".vc-config.json"),
  JSON.stringify(
    {
      runtime:      "nodejs20.x",
      handler:      "index.mjs",
      launcherType: "Nodejs",
    },
    null,
    2,
  ),
);

/* ── 5. Write route rules ─────────────────────────────────────────── */

console.log("▶ Writing Vercel config…");
writeFileSync(
  join(out, "config.json"),
  JSON.stringify(
    {
      version: 3,
      routes: [
        // Static assets — long-lived cache
        {
          src: "/assets/(.*)",
          headers: { "cache-control": "public, max-age=31536000, immutable" },
          dest: "/assets/$1",
        },
        { src: "/favicon\\.svg", dest: "/favicon.svg" },
        // Let Vercel serve files that actually exist in static/
        { handle: "filesystem" },
        // Everything else → SSR function
        { src: "/(.*)", dest: "/_render" },
      ],
    },
    null,
    2,
  ),
);

console.log("✓ .vercel/output/ ready for deployment");
