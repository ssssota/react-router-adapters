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

  return {
    name: "react-router-adapter",

    // Configures the server build environment to use the virtual server entry point.
    config() {
      const opts = { input: SERVER_ENTRY } as const;
      return {
        environments: {
          server: { build: { rolldownOptions: opts, rollupOptions: opts } },
        },
      };
    },
    configResolved(config) {
      root = config.root;
    },
    configureServer(server) {
      server.middlewares.use(createMiddleware(server, options));
    },

    resolveId: {
      filter: {
        id: /^virtual:react-router-adapters\/server-entry$/,
      },
      handler(id) {
        if (id !== SERVER_ENTRY) return null;
        return RESOLVED_SERVER_ENTRY;
      },
    },

    load: {
      filter: {
        id: RESOLVED_SERVER_ENTRY,
      },
      handler(id) {
        if (id !== RESOLVED_SERVER_ENTRY) return null;
        const entry = path.resolve(root, options.entry);
        const exportName = options.export ?? "default";
        return `\
import * as build from "virtual:react-router/server-build";
import mount from ${JSON.stringify(`${MODULE_NAME}/${options.framework}`)};
import * as appModule from ${JSON.stringify(entry)};
const app = appModule[${JSON.stringify(exportName)}];

mount(app, build);
`;
      },
    },
  };
}
