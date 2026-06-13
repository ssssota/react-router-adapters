import * as fs from "node:fs/promises";
import * as path from "node:path";

const CONTENT_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

export async function serveStatic(request: Request, roots: string[]): Promise<Response | null> {
  if (request.method !== "GET" && request.method !== "HEAD") return null;

  const pathname = getPathname(request.url);
  if (!pathname) return null;

  for (const root of roots) {
    const filePath = resolveFilePath(root, pathname);
    if (!filePath) continue;

    const file = await fs.readFile(filePath).catch(() => null);
    if (!file) continue;

    return new Response(request.method === "HEAD" ? null : file, {
      headers: {
        "content-type":
          CONTENT_TYPES[path.extname(filePath).toLowerCase()] ?? "application/octet-stream",
      },
    });
  }

  return null;
}

function getPathname(url: string): string | null {
  try {
    const pathname = decodeURIComponent(new URL(url).pathname);
    return pathname.endsWith("/") ? `${pathname}index.html` : pathname;
  } catch {
    return null;
  }
}

function resolveFilePath(root: string, pathname: string): string | null {
  const rootPath = path.resolve(root);
  const filePath = path.resolve(rootPath, pathname.replace(/^[/\\]+/, ""));
  const relativePath = path.relative(rootPath, filePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) return null;
  return filePath;
}
