import * as esbuild from "esbuild";
import { cpSync } from "fs";

const watch = process.argv.includes("--watch");

const buildOptions = {
  entryPoints: {
    content: "src/content/index.ts",
  },
  bundle: true,
  outdir: "dist",
  target: "chrome120",
  format: "iife",
  minify: !watch,
  // The panel CSS is injected into its shadow root as a string
  loader: { ".css": "text" },
};

// Copy static files to dist
cpSync("manifest.json", "dist/manifest.json");
cpSync("icons", "dist/icons", {
  recursive: true,
  filter: (src) => !src.endsWith(".sh"),
});

if (watch) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log("Watching for changes...");
} else {
  await esbuild.build(buildOptions);
  console.log("Build complete.");
}
