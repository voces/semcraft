import { exit } from "./exit.ts";
import { fireball } from "./fireball.ts";
import { firebolt } from "./firebolt.ts";
import { move } from "./move.ts";
import { poisonNova } from "./poisonNova.ts";
import { teleport } from "./teleport.ts";

export const actions = { firebolt, move, exit, poisonNova, fireball, teleport };
export type ClientActions = typeof actions;
export type ClientAction = ClientActions[keyof ClientActions];
