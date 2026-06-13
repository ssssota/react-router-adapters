import { createRequestHandler } from "react-router";
import type { ServerBuild } from "react-router";

export function createHandler(build: ServerBuild) {
  return createRequestHandler(build, import.meta.env.MODE);
}
