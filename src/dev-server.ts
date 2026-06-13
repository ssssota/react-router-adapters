import { createRequest, sendResponse } from "@remix-run/node-fetch-server";
import type { Connect, ViteDevServer } from "vite";
import type { Options } from "./types.js";

export function createMiddleware(
  server: ViteDevServer,
  options: Options,
): Connect.NextHandleFunction {
  return async (req, res, next) => {
    const app = await loadApp(server, options);
    const request = createRequest(req, res);
    const response = await app.fetch(request);
    if (response.status === 404) {
      return next();
    }
    await sendResponse(res, response);
  };
}

async function loadApp(
  server: ViteDevServer,
  options: Options,
): Promise<{ fetch: (request: Request) => Response | Promise<Response> }> {
  // Load the app module
  const module = await server.ssrLoadModule(options.entry);
  // Get the app (Hono or Elysia or H3)
  const app = module[options.export ?? "default"];
  if ("fetch" in app && typeof app.fetch === "function") {
    return app;
  }
  throw new Error("App does not have a fetch method");
}
