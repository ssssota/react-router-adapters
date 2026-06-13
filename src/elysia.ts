import { createHandler } from "./handler.js";
import type { AnyElysia } from "elysia";
import type { Start } from "./types.js";
import { node } from "@elysia/node";
import { serveStatic } from "./static.js";

export const start: Start<AnyElysia> = (app, build, publicDir = "public") => {
  const handler = createHandler(build);
  app.onError(({ code, request }) => {
    if (code !== "NOT_FOUND") return;
    return serveStatic(request, [build.assetsBuildDirectory, publicDir]).then(
      (response) => response ?? handler(request),
    );
  });

  if (app["~adapter"].name !== "@elysiajs/node") app["~adapter"] = node();
  app.listen(Number(process.env.PORT || 3000));
};
