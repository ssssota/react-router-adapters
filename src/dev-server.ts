import { createRequest, sendResponse } from "@remix-run/node-fetch-server";
import type { Connect, ViteDevServer } from "vite";
import type { Options } from "./types.js";

export function createMiddleware(
  server: ViteDevServer,
  options: Options,
): Connect.NextHandleFunction {
  return async (req, res, next) => {
    try {
      const app = await loadApp(server, options);
      const request = createRequest(req, res);
      const response = await app.fetch(request);
      if (response.status === 404) {
        return next();
      }
      await sendResponse(res, response);
    } catch (error) {
      next(error);
    }
  };
}

async function loadApp(
  server: ViteDevServer,
  options: Options,
): Promise<{ fetch: (request: Request) => Response | Promise<Response> }> {
  const module = await server.ssrLoadModule(options.entry);
  const app = module[options.export ?? "default"];
  if (app && typeof app === "object" && "fetch" in app && typeof app.fetch === "function") {
    return app;
  }
  throw new TypeError(
    `The "${options.export ?? "default"}" export from "${options.entry}" must expose a fetch method`,
  );
}
