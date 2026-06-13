# React Router Adapters

Use Hono, H3, or Elysia as the HTTP server for a React Router framework-mode application.

Supported frameworks:

- [Hono](https://hono.dev/)
- [H3](https://h3.dev/)
- [Elysia](https://elysiajs.com/)

## Requirements

- Node.js 20 or later
- React Router 7
- Vite 8

## Installation

Install this package and one supported server framework:

- Hono
  ```sh
  pnpm add react-router-adapters hono @hono/node-server
  ```
- H3
  ```sh
  pnpm add react-router-adapters h3
  ```
- Elysia
  ```sh
  pnpm add react-router-adapters elysia @elysiajs/node
  ```

## Usage

Add the adapter after the React Router plugin in your Vite config:

```ts
// vite.config.ts
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import { rrAdapter } from "react-router-adapters";

export default defineConfig({
  plugins: [reactRouter(), rrAdapter({ entry: "server.ts", framework: "hono" })],
});
```

Enable the Vite Environment API in your React Router config:

```ts
// react-router.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  future: {
    v8_viteEnvironmentApi: true,
  },
} satisfies Config;
```

Create the server entry referenced by the adapter:

```ts
// server.ts
import { Hono } from "hono";

export default new Hono().get("/api/health", (c) => {
  return c.json({ status: "ok" });
});
```

Requests handled by the server framework take precedence. Unmatched requests
are passed to React Router. The production server also serves the React Router
client build and files from Vite's `publicDir`.

Run the generated server build directly:

```jsonc
// package.json
{
  "scripts": {
    "build": "react-router build",
    "dev": "react-router dev",
    "start": "node ./build/server/index.js",
    "typecheck": "react-router typegen && tsc",
  },
}
```

### Named Exports

Server entries use the default export unless `export` is specified:

```ts
// server.ts
export const app = new Hono().get("/api/health", (c) => {
  return c.json({ status: "ok" });
});
// vite.config.ts
rrAdapter({
  entry: "server.ts",
  export: "app", // export name of the server app
  framework: "hono",
});
```

## Examples

Complete projects are available in:

- [`examples/hono`](./examples/hono)
- [`examples/h3`](./examples/h3)
- [`examples/elysia`](./examples/elysia)

Run all example builds and end-to-end server tests with:

```sh
pnpm test
```

## License

MIT
