#!/usr/bin/env node
/**
 * Vercel Build Output API v3 adapter for TanStack Start.
 *
 * Produces the .vercel/output/ directory structure that Vercel reads natively:
 *   .vercel/output/static/          ← CDN-served client assets
 *   .vercel/output/functions/       ← Serverless function (Node.js)
 *   .vercel/output/config.json      ← Route rules
 *
 * Key difference vs naive approach: server.js has external imports (h3-v2,
 * @tanstack/router-core, react, etc.) that Vite's SSR build leaves unbundled.
 * We use esbuild to rebundle server.js + all deps into a single self-contained
 * ESM file. A require() shim in the banner allows CJS packages (react-dom,
 * etc.) to call require("util"/"stream"/…) at runtime through Node's resolver.
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
import { createRequire } from "node:module";

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

// ── 4a. Bundle server.js + ALL deps into a single self-contained file ─
//
// TanStack Start's Vite SSR build externalises packages like h3-v2,
// @tanstack/router-core, seroval, react, react-dom, etc.
//
// Vercel's Build Output API v3 does NOT automatically provide node_modules
// for manually-created functions — so the function crashes on boot.
//
// Fix A: esbuild --bundle inlines every npm dep from the project's
//        node_modules, leaving only genuine Node.js built-ins external.
//
// Fix B: CJS packages (react-dom/server.node.js, etc.) call require()
//        at runtime.  When those are bundled into an ESM file, the
//        require() calls fail ("Dynamic require not supported").
//        → Inject a real createRequire-based shim via the banner so
//          those calls resolve correctly at runtime.
// ─────────────────────────────────────────────────────────────────────

console.log("▶ Bundling server with esbuild (inlining all deps)…");
const req = createRequire(import.meta.url);
const esbuild = req("esbuild");

// Node.js built-in module names (bare, without "node:" prefix)
// These must stay external so the runtime provides them.
const NODE_BUILTINS = [
  "assert", "async_hooks", "buffer", "child_process", "cluster",
  "console", "constants", "crypto", "dgram", "diagnostics_channel",
  "dns", "domain", "events", "fs", "http", "http2", "https",
  "inspector", "module", "net", "os", "path", "perf_hooks", "process",
  "punycode", "querystring", "readline", "repl", "stream",
  "string_decoder", "sys", "timers", "tls", "trace_events", "tty",
  "url", "util", "v8", "vm", "wasi", "worker_threads", "zlib",
];

await esbuild.build({
  entryPoints: [join(root, "dist", "server", "server.js")],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",

  // ── What stays external ───────────────────────────────────────────
  // "node:*"   — prefixed imports  (e.g. import { x } from "node:util")
  // bare names — un-prefixed CJS requires (e.g. require("util"))
  external: ["node:*", ...NODE_BUILTINS],

  outfile: join(fnDir, "server-bundle.mjs"),

  // server.js uses relative imports for the assets/ chunks in the same dir
  absWorkingDir: join(root, "dist", "server"),

  // ── CJS compat: inject a real require() into the ESM bundle ──────
  // react-dom/server.node.js and other CJS packages call require("util"),
  // require("stream"), etc. at runtime.  Without this shim they throw
  // "Dynamic require of X is not supported" inside the esbuild wrapper.
  banner: {
    js: `
import { createRequire as __cjsCreateRequire } from "node:module";
const require = __cjsCreateRequire(import.meta.url);
`,
  },

  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },

  // Keep stack traces readable in Vercel logs
  minify: false,
});

console.log("  ✓ server-bundle.mjs written");

// ── 4b. Write the Vercel function entry point ──────────────────────
//
// server-bundle.mjs exports: { default: { fetch(Request): Promise<Response> } }
// Vercel Node.js runtime calls: handler(req: IncomingMessage, res: ServerResponse)
// We bridge the two using only Node.js built-ins.
// ─────────────────────────────────────────────────────────────────────

writeFileSync(
  join(fnDir, "index.mjs"),
  `/**
 * Vercel serverless function — Node.js (IncomingMessage/ServerResponse)
 * → Web Fetch API (Request/Response) bridge.
 *
 * server-bundle.mjs is fully self-contained (all deps inlined by esbuild).
 */
import { Buffer } from "node:buffer";
import server from "./server-bundle.mjs";

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
      shouldAddHelpers: false,
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
