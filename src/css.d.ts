// CSS files are bundled as text by esbuild (see build.mjs).
declare module "*.css" {
  const css: string;
  export default css;
}
