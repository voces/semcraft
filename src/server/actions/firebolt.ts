/**
 * IDEA!
 * Instead of a simple cast rate modifier, we could make it a fun calculation.
 * - We'll track each usage of a specific rune.
 * - We'll track each transition from rune A to rune B.
 * - The total cast time will be:
 *   sum(usages.map(t => 10_000/(t + 10_000))) + sum(transitions.map(t => 2_500/(t + 10_000)))
 * - Note unlike affinities, this is not zero-sum.
 */

import { Affinity } from "../../core/Entity.ts";
import { currentHero, normalizeAffinities } from "../../hero.ts";
import { currentSemcraft } from "../../semcraftContext.ts";
import { setFind } from "../util.ts";
import { Action, newCooldown } from "./util.ts";

const onCooldown = newCooldown(100);

export const firebolt: Action<"firebolt"> = (
  { x, y, fireMana: fire, conjurationMana: conjuration },
) => {
  // Verify spell can be used
  const hero = currentHero();
  const mana = fire + conjuration;
  if (onCooldown(hero) || hero.mana < mana || mana < 0.1) return;

  // Adjust affinities
  hero.affinities[Affinity.fire] +=
    (fire * (1 - hero.affinities[Affinity.fire])) ** (1 / 3) / 1000;
  hero.affinities[Affinity.conjuration] +=
    (conjuration * (1 - hero.affinities[Affinity.conjuration])) ** (1 / 3) /
    1000;
  hero.affinities = normalizeAffinities(hero.affinities);

  // Calculate the mana used in the spell
  fire *= hero.affinities[Affinity.fire];
  conjuration *= hero.affinities[Affinity.conjuration];
  hero.mana -= mana;

  // Calculate spell components
  const speed = ((fire + conjuration) / conjuration) ** 0.5 / 2;
  const physicalDamage = conjuration * (speed / 2) ** 2 * 4;
  const fireDamage = fire * 10;
  const damage = physicalDamage + fireDamage;
  const size = conjuration ** 0.2 / 2;
  const duration = fire ** 0.1 + conjuration ** 0.2 * 6;

  const semcraft = currentSemcraft();
  const firebolt = semcraft.add({
    owner: hero.owner,
    x: hero.x,
    y: hero.y,
    moveAlong: Math.atan2(y - hero.y!, x - hero.x!),
    art: {
      geometry: {
        type: "sphere",
        radius: size,
      },
      material: {
        type: "phong",
        color: "red", // TODO: tint based off fire/conjuration?
      },
    },
    speed,
    timeout: {
      remaining: duration,
      callback: () => semcraft.delete(firebolt),
    },
    collision: {
      radius: size + 0.5,
      callback: (entities) => {
        const entity = setFind(entities, (e) => e.owner !== firebolt.owner);
        if (!entity) return;

        semcraft.delete(firebolt);
        if (typeof entity.life === "number" && entity.life > 0) {
          entity.life -= damage;
        }
      },
    },
  });
};
