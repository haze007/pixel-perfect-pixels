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

// ─────────────────────────────────────────────────────────────────────────────
// Function entry point.
//
// server.js exports: { default: { fetch(Request): Promise<Response> } }
// That's a standard Web Fetch API handler (Request → Response).
//
// Vercel Node.js runtime calls: handler(req: IncomingMessage, res: ServerResponse)
//
// We bridge the two WITHOUT importing any external modules — everything needed
// is already bundled inside server.js (h3-v2, async_hooks, etc.).
// ─────────────────────────────────────────────────────────────────────────────
writeFileSync(
  join(fnDir, "index.mjs"),
  `/**
 * Vercel serverless function — Node.js (IncomingMessage/ServerResponse)
 * → Web Fetch API (Request/Response) bridge.
 *
 * No external imports needed: server.js is fully self-contained.
 */
import { Readable } from "node:stream";
import { Buffer } from "node:buffer";
import server from "./server.js";

export default async function handler(req, res) {
  try {
    // ── Build the full URL ───────────────────────────────────────────
    const proto = req.headers["x-forwarded-proto"] ?? "https";
    const host  = req.headers["x-forwarded-host"] ?? req.headers["host"] ?? "localhost";
    const url   = \`\${proto}://\${host}\${req.url ?? "/"}\`;

    // ── Collect request body ─────────────────────────────────────────
    let body = null;
    if (req.method !== "GET" && req.method !== "HEAD") {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      if (chunks.length > 0) body = Buffer.concat(chunks);
    }

    // ── Build Web Request ────────────────────────────────────────────
    // Vercel IncomingMessage headers are already a plain object; Headers() accepts it.
    const webReq = new Request(url, {
      method:  req.method ?? "GET",
      headers: req.headers,
      body,
      // @ts-ignore duplex required by Node.js for streaming bodies
      duplex: "half",
    });

    // ── Call TanStack Start's fetch handler ──────────────────────────
    const webRes = await server.fetch(webReq);

    // ── Write status + headers ───────────────────────────────────────
    res.statusCode = webRes.status;
    webRes.headers.forEach((value, key) => {
      // Skip headers that Node.js manages automatically
      if (key.toLowerCase() !== "transfer-encoding") {
        res.setHeader(key, value);
      }
    });

    // ── Stream response body ─────────────────────────────────────────
    if (webRes.body) {
      const reader = webRes.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  } catch (err) {
    console.error("[_render] Unhandled error:", err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "text/plain");
    }
    res.end("Internal Server Error");
  }
}
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
        // Static assets — long-lived CDN cache
        {
          src: "/assets/(.*)",
          headers: { "cache-control": "public, max-age=31536000, immutable" },
          dest: "/assets/$1",
        },
        { src: "/favicon\\.svg", dest: "/favicon.svg" },
        // Serve any file that literally exists in static/ (e.g. future public/ assets)
        { handle: "filesystem" },
        // Everything else (all app routes) → SSR function
        { src: "/(.*)", dest: "/_render" },
      ],
    },
    null,
    2,
  ),
);

console.log("✓ .vercel/output/ ready for deployment");
