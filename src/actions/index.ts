import { exit } from "./exit.ts";
import { firebolt } from "./firebolt.ts";
import { move } from "./move.ts";

export type { Action } from "./util.ts";

export const actions = {
  move,
  firebolt,
  exit,
};
