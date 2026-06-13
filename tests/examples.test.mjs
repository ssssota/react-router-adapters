import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const frameworks = ["hono", "h3", "elysia"];

for (const framework of frameworks) {
  test(`${framework} example serves framework, React Router, and static routes`, async (t) => {
    const port = await getAvailablePort();
    const cwd = path.join(root, "examples", framework);
    const server = spawn(process.execPath, ["build/server/index.js"], {
      cwd,
      env: { ...process.env, PORT: String(port) },
      stdio: ["ignore", "pipe", "pipe"],
    });
    const output = [];

    server.stdout.on("data", (chunk) => output.push(chunk.toString()));
    server.stderr.on("data", (chunk) => output.push(chunk.toString()));
    t.after(() => server.kill());

    const baseUrl = `http://127.0.0.1:${port}`;
    await waitForServer(server, `${baseUrl}/api/health`, output);

    const health = await fetch(`${baseUrl}/api/health`);
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { framework, status: "ok" });

    const home = await fetch(baseUrl);
    const homeHtml = await home.text();
    assert.equal(home.status, 200);
    assert.match(homeHtml, new RegExp(`data-framework="${framework}"`));

    const about = await fetch(`${baseUrl}/about`);
    assert.equal(about.status, 200);
    assert.match(await about.text(), new RegExp(`${framework}`, "i"));

    const publicAsset = await fetch(`${baseUrl}/example.txt`);
    assert.equal(publicAsset.status, 200);
    assert.equal((await publicAsset.text()).trim(), `public asset from ${framework}`);

    const scriptPath = homeHtml.match(/<(?:link|script)[^>]+(?:href|src)="([^"]+\.js)"/)?.[1];
    assert.ok(scriptPath, "SSR response should reference a client JavaScript asset");

    const clientAsset = await fetch(new URL(scriptPath, baseUrl));
    assert.equal(clientAsset.status, 200);
    assert.match(clientAsset.headers.get("content-type") ?? "", /javascript/);
  });
}

async function getAvailablePort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const { port } = address;
  server.close();
  await once(server, "close");
  return port;
}

async function waitForServer(server, url, output) {
  const deadline = Date.now() + 20_000;

  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      assert.fail(`Server exited with code ${server.exitCode}\n${output.join("")}`);
    }

    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The server has not started listening yet.
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  assert.fail(`Server did not become ready\n${output.join("")}`);
}
