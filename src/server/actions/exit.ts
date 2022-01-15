import { currentHero } from "../../hero.ts";
import { currentSemcraft } from "../../semcraftContext.ts";
import { Action } from "./util.ts";

export const exit: Action<"exit"> = () =>
  currentSemcraft().delete(currentHero());
