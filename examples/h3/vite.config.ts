import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import { rrAdapter } from "react-router-adapters";

export default defineConfig({
  plugins: [reactRouter(), rrAdapter({ entry: "server.ts", framework: "h3" })],
});
