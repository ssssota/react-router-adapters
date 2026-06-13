import { createHandler } from "./handler.js";
import type { Start } from "./types.js";
import type { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { serve } from "@hono/node-server";
import * as path from "node:path";

export const start: Start<Hono> = (app, build) => {
  app.use(
    path.posix.join(build.publicPath, "*"),
    serveStatic({ root: build.assetsBuildDirectory }),
  );
  app.use("*", serveStatic({ root: "public" }));

  const handler = createHandler(build);
  app.all("*", (c) => handler(c.req.raw));

  serve({
    fetch: app.fetch,
    port: Number(process.env.PORT) || 3000,
  });
};
