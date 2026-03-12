import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    bin: "src/bin.ts",
    index: "src/index.ts"
  },
  format: ["esm"],
  dts: false, // Not needed for MCP server runtime
  clean: true,
  bundle: true,
  external: ["@modelcontextprotocol/sdk"],
  noExternal: [], // No @codemcp/* dependencies to bundle
  target: "node20",
  sourcemap: false
});
