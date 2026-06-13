import { createRequestHandler } from "react-router";
import type { ServerBuild, RequestHandler } from "react-router";

export function createHandler(build: ServerBuild): RequestHandler {
  return createRequestHandler(build, import.meta.env.MODE);
}
