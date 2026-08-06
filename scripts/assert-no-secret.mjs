import { readdir, readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
const [sentinel, target = ".next/static"] = process.argv.slice(2); if (!sentinel) { console.error("usage: node scripts/assert-no-secret.mjs <sentinel> [path]"); process.exit(2); }
const needle = Buffer.from(sentinel); let found = false;
async function scan(path) { const info = await stat(path); if (info.isDirectory()) { for (const entry of await readdir(path)) await scan(resolve(path, entry)); return; } const data = await readFile(path); if (data.includes(needle)) { console.error(`secret sentinel found: ${path}`); found = true; } }
try { await scan(resolve(target)); } catch (error) { console.error(error instanceof Error ? error.message : String(error)); process.exit(2); } process.exit(found ? 1 : 0);
