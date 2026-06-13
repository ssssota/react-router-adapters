import { H3 } from "h3";

export default new H3().get("/api/health", () => {
  return { framework: "h3", status: "ok" };
});
