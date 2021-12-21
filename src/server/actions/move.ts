import { currentHero } from "../../hero.ts";
import { Action } from "./util.ts";

export const move: Action<"move"> = (data) => {
  currentHero().moveTo = { x: data.x, y: data.y };
};
