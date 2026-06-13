import type { ServerBuild } from "react-router";

export type Options = SharedOptions & FrameworkSpecificOptions;
export type SharedOptions = {
  /**
   * Server entry module.
   */
  entry: string;
  /**
   * @default "default"
   */
  export?: string;
};
export type FrameworkSpecificOptions = HonoOptions | H3Options | ElysiaOptions;
export type HonoOptions = {
  framework: "hono";
};
export type H3Options = {
  framework: "h3";
};
export type ElysiaOptions = {
  framework: "elysia";
};

export type Start<T> = (app: T, build: ServerBuild) => void;
