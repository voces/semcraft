import { Entity } from "../core/Entity.ts";
import { currentHero } from "../hero.ts";
import { currentSemcraft } from "../semcraftContext.ts";
import { currentMouse } from "../systems/mouse.ts";
import { action } from "./util.ts";

/**
 * IDEA!
 * Instead of a simple cast rate modifier, we could make it a fun calculation.
 * - We'll track each usage of a specific rune.
 * - We'll track each transition from rune A to rune B.
 * - The total cast time will be:
 *   sum(usages.map(t => 10_000/(t + 10_000))) + sum(transitions.map(t => 2_500/(t + 10_000)))
 * - Note unlike affinities, this is not zero-sum.
 */

let localCooldown = -Infinity;
const cooldowns = new WeakMap<Entity, number>();

const COOLDOWN = 750;

export const firebolt = action({
  clientHandler: () => {
    const now = Date.now();
    if (now - localCooldown < COOLDOWN) return;
    localCooldown = now;

    const { ground: { x, y } } = currentMouse();
    return { action: "firebolt", x, y };
  },
  serverHandler: ({ x, y }) => {
    const hero = currentHero();

    const now = Date.now();
    const last = cooldowns.get(hero) ?? -Infinity;
    if (now - last < COOLDOWN) return;
    cooldowns.set(hero, now);

    const semcraft = currentSemcraft();
    const firebolt = semcraft.add({
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
  },
});
