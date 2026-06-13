import { createHandler } from "./handler.js";
import type { Start } from "./types.js";
import type { H3, Middleware } from "h3";
import * as path from "node:path";
import { serveStatic as h3ServeStatic, serve } from "h3";
import * as fs from "node:fs/promises";

export const start: Start<H3> = (app, build, publicDir = "public") => {
  app.use(
    path.posix.join(build.publicPath, "**"),
    serveStatic({ root: build.assetsBuildDirectory }),
  );
  app.use("/**", serveStatic({ root: publicDir }));

  const handler = createHandler(build);
  app.all("/**", (ev) => handler(ev.req));

  serve(app, {
    port: Number(process.env.PORT) || 3000,
  });
};

function serveStatic(options: { root: string }): Middleware {
  return (ev) => {
    return h3ServeStatic(ev, {
      fallthrough: true,
      getContents: (id) => fs.readFile(path.join(options.root, id)).catch(() => undefined),
      getMeta: (id) =>
        fs.stat(path.join(options.root, id)).then(
          (stats) => (stats.isFile() ? { size: stats.size, mtime: stats.mtime } : undefined),
          () => undefined,
        ),
    });
  };
}
