import { createHandler } from "./handler.js";
import type { AnyElysia } from "elysia";
import type { Start } from "./types.js";
import { staticPlugin } from "@elysia/static";
import { node } from "@elysia/node";

export const start: Start<AnyElysia> = (app, build, publicDir = "public") => {
  app.use(
    staticPlugin({
      assets: build.assetsBuildDirectory,
      prefix: build.publicPath,
    }),
  );
  app.use(staticPlugin({ prefix: "", assets: publicDir }));

  const handler = createHandler(build);
  app.all("*", (c) => handler(c.request));

  // Ensure the adapter is set to node if not already
  if (app["~adapter"].name !== "@elysiajs/node") app["~adapter"] = node();
  app.listen(Number(process.env.PORT || 3000));
};
