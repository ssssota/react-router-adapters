# React Router Adapters

Mount your React Router app on server framework.

Supported frameworks:

- [Hono](https://hono.dev/)
- [H3](https://h3.dev/)
- [Elysia](https://elysiajs.com/)

## Usage

```sh
pnpm install -D react-router-adapters
```

Put `react-router-adapters` plugin in your Vite config.

```ts
// vite.config.ts
import { rrAdapter } from "react-router-adapters";
// ...
export default defineConfig({
  plugins: [reactRouter(), rrAdapter({ entry: "server.ts", framework: "hono" })],
});
```

Enable `v8_viteEnvironmentApi` in your React Router config.

```ts
// react-router.config.ts
export default {
  ssr: true,
  future: {
    v8_viteEnvironmentApi: true,
  },
};
```

Create entry module `server.ts`.

```ts
// server.ts
import { Hono } from "hono";
export default new Hono().get("/health", (c) => c.json({ status: "ok" }));
```

Change start script in `package.json`.

```jsonc
// package.json
{
  "scripts": {
    "build": "react-router build",
    "dev": "react-router dev",
    "start": "node ./build/server/index.js", // Run the server directly
    "typecheck": "react-router typegen && tsc",
  },
}
```

## License

MIT
