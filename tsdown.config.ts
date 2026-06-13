import { defineConfig } from "tsdown";

const frameworks = ["hono", "h3", "elysia"];

export default defineConfig({
  dts: true,
  platform: "node",
  entry: ["src/index.ts", ...frameworks.map((f) => `src/${f}.ts`)],
});
