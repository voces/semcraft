import { currentHero } from "../../hero.ts";
import { Action, newRateLimit } from "./util.ts";

const rateLimited = newRateLimit(100);

export const move: Action<"move"> = (data) => {
  const hero = currentHero();
  if (rateLimited(hero)) return;
  hero.moveTo = { x: data.x, y: data.y };
};
