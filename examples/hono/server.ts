import { Hono } from "hono";

export default new Hono().get("/api/health", (context) => {
  return context.json({ framework: "hono", status: "ok" });
});
