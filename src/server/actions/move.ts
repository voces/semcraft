import { currentHero } from "../../hero.ts";
import { Action, newCooldown } from "./util.ts";

const onCooldown = newCooldown(250);

export const move: Action<"move"> = (data) => {
  const hero = currentHero();
  if (onCooldown(hero)) return;
  hero.moveTo = { x: data.x, y: data.y };
};
