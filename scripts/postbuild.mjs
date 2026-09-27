// Vercel serves real files before applying rewrites, so a dist/index.html would be
// returned for "/" as-is and the home page would skip api/render.js. Renaming the
// built shell to app.html sends every page route through the renderer, which
// fetches /app.html as its template.
import { renameSync, existsSync } from "node:fs";

const from = "dist/index.html";
const to = "dist/app.html";

if (!existsSync(from)) {
  console.error(`postbuild: ${from} not found – did vite build run?`);
  process.exit(1);
}
renameSync(from, to);
console.log(`postbuild: ${from} -> ${to}`);
