import type { Plugin } from "vite";
import type { Options } from "./types.js";
import { createMiddleware } from "./dev-server.js";
import path from "node:path";
import process from "node:process";

const MODULE_NAME = "react-router-adapters";
const SERVER_ENTRY = "virtual:react-router-adapters/server-entry";
const RESOLVED_SERVER_ENTRY = `\0${SERVER_ENTRY}`;

export function rrAdapter(options: Options): Plugin {
  let root = process.cwd();
  let publicDir = "public";

  return {
    name: "react-router-adapter",

    // Configures the server build environment to use the virtual server entry point.
    config() {
      const opts = { input: SERVER_ENTRY } as const;
      return {
        environments: {
          ssr: { build: { rolldownOptions: opts, rollupOptions: opts } },
        },
      };
    },
    configResolved(config) {
      root = config.root;
      publicDir = path.relative(root, config.publicDir);
    },
    configureServer(server) {
      server.middlewares.use(createMiddleware(server, options));
    },

    resolveId: {
      filter: {
        id: idToRegex(SERVER_ENTRY),
      },
      handler(id) {
        if (id !== SERVER_ENTRY) return null;
        return RESOLVED_SERVER_ENTRY;
      },
    },

    load: {
      filter: {
        id: idToRegex(RESOLVED_SERVER_ENTRY),
      },
      handler(id) {
        if (id !== RESOLVED_SERVER_ENTRY) return null;
        const entry = path.resolve(root, options.entry);
        const exportName = options.export ?? "default";
        return `\
import * as build from "virtual:react-router/server-build";
import { start } from ${JSON.stringify(`${MODULE_NAME}/${options.framework}`)};
import * as appModule from ${JSON.stringify(entry)};
const app = appModule[${JSON.stringify(exportName)}];

start(app, build, ${JSON.stringify(publicDir)});
`;
      },
    },
  };
}

function idToRegex(id: string): RegExp {
  return new RegExp(`^${id}$`);
}
