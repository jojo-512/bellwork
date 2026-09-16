import * as esbuild from "esbuild";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));

const result = await esbuild.build({
  entryPoints: [join(root, "entry.jsx")],
  bundle: true,
  write: false,
  format: "iife",
  jsx: "automatic",
  minify: true,
  target: ["es2018"],
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});

const bundle = result.outputFiles[0].text;
const template = readFileSync(join(root, "index.template.html"), "utf8");
if (!template.includes("__BELLWORK_BUNDLE__")) {
  throw new Error("index.template.html missing __BELLWORK_BUNDLE__ placeholder");
}
// Avoid prematurely closing the HTML script tag if the bundle contains that sequence.
const safeBundle = bundle.replace(/<\/script/gi, "<\\/script");
// Use a function replacer so `$` sequences inside the minified bundle
  // are not treated as String.replace substitution patterns.
  const html = template.replace("__BELLWORK_BUNDLE__", () => safeBundle);
writeFileSync(join(root, "index.html"), html);
console.log(`Wrote index.html (${html.length} bytes, bundle ${bundle.length} bytes)`);
