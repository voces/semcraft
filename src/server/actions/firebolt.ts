/**
 * IDEA!
 * Instead of a simple cast rate modifier, we could make it a fun calculation.
 * - We'll track each usage of a specific rune.
 * - We'll track each transition from rune A to rune B.
 * - The total cast time will be:
 *   sum(usages.map(t => 10_000/(t + 10_000))) + sum(transitions.map(t => 2_500/(t + 10_000)))
 * - Note unlike affinities, this is not zero-sum.
 */

import { currentHero } from "../../hero.ts";
import { currentSemcraft } from "../../semcraftContext.ts";
import { Action, newCooldown } from "./util.ts";

const onCooldown = newCooldown(750);

export const firebolt: Action<"firebolt"> = ({ x, y }) => {
  const hero = currentHero();
  if (onCooldown(hero)) return;

  const semcraft = currentSemcraft();
  const firebolt = semcraft.add({
    name: "firebolt",
    x: hero.x,
    y: hero.y,
    moveAlong: Math.atan2(y - hero.y!, x - hero.x!),
    art: {
      geometry: {
        type: "sphere",
        radius: 0.125,
      },
      material: {
        type: "phong",
        color: "red",
      },
    },
    speed: 5,
    timeout: 4,
    callback: () => semcraft.clear(firebolt),
  });
};
