import { exit } from "./exit.ts";
import { firebolt } from "./firebolt.ts";
import { move } from "./move.ts";
import { poisonNova } from "./poisonNova.ts";

export const actions = { firebolt, move, exit, poisonNova };
export type ClientActions = typeof actions;
export type ClientAction = ClientActions[keyof ClientActions];
