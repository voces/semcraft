import { exit } from "./exit.ts";
import { fireball } from "./fireball.ts";
import { firebolt } from "./firebolt.ts";
import { move } from "./move.ts";
import { poisonNova } from "./poisonNova.ts";

export const actions = { firebolt, move, exit, poisonNova, fireball };
export type ClientActions = typeof actions;
export type ClientAction = ClientActions[keyof ClientActions];
