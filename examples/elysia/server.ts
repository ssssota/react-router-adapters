import { Elysia } from "elysia";

export default new Elysia().get("/api/health", () => {
  return { framework: "elysia", status: "ok" };
});
