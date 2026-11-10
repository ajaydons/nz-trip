#!/usr/bin/env node
// Encrypts the trip guide and prepares the docs/ folder for GitHub Pages.
// Usage:  node build.mjs            (asks for the password)
//         STATICRYPT_PASSWORD='...' node build.mjs
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(root, "source");
const docs = path.join(root, "docs");
const tmp = path.join(root, ".encrypt-tmp");

const sources = fs.readdirSync(srcDir).filter((f) => f.endsWith(".html"))
  .map((f) => ({ f, t: fs.statSync(path.join(srcDir, f)).mtimeMs })).sort((a, b) => b.t - a.t);
if (!sources.length) { console.error("✖ Put the guide (NZ_South_Island_Trip_Guide.html) in the source/ folder first."); process.exit(1); }
const input = path.join(srcDir, sources[0].f);
console.log("• Encrypting " + sources[0].f);

fs.rmSync(tmp, { recursive: true, force: true });
const args = ["--yes", "staticrypt@3.5.4", path.join("source", sources[0].f), "-d", ".encrypt-tmp",
  "-t", path.join("template", "password.html"),
  "-c", ".staticrypt.json",
  "--remember", "0",
  "--template-color-primary", "#1f3a2e",
  "--template-color-secondary", "#1b362c",
  "--template-title", "NZ Trip guide",
  "--template-instructions", "Family road trip · 22 Nov – 1 Dec 2026",
  "--template-placeholder", "Trip password",
  "--template-button", "Open the guide",
  "--template-remember", "Remember me on this device",
  "--template-error", "That password didn’t work. Please try again."];
if (process.env.STATICRYPT_PASSWORD) args.push("--short");
const run = spawnSync("npx", args, { cwd: root, stdio: "inherit", env: process.env, shell: process.platform === "win32" });
if (run.status !== 0) { console.error("✖ Encryption failed."); process.exit(run.status || 1); }

fs.mkdirSync(docs, { recursive: true });
fs.copyFileSync(path.join(tmp, sources[0].f), path.join(docs, "index.html"));
fs.rmSync(tmp, { recursive: true, force: true });

// Stamp the service worker so phones pick up the new version
const h = createHash("sha256");
for (const f of ["index.html", "manifest.webmanifest"]) h.update(fs.readFileSync(path.join(docs, f)));
const version = h.digest("hex").slice(0, 12);
const sw = fs.readFileSync(path.join(root, "tools", "sw.template.js"), "utf8").replace("__VERSION__", version);
fs.writeFileSync(path.join(docs, "sw.js"), sw);

const kb = (fs.statSync(path.join(docs, "index.html")).size / 1024).toFixed(0);
console.log(`✔ docs/index.html (${kb} KB, encrypted) · service worker version ${version}`);
console.log("Next:  git add docs .staticrypt.json && git commit -m \"Update guide\" && git push");
