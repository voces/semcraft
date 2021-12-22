/**
 * IDEA!
 * Instead of a simple cast rate modifier, we could make it a fun calculation.
 * - We'll track each usage of a specific rune.
 * - We'll track each transition from rune A to rune B.
 * - The total cast time will be:
 *   sum(usages.map(t => 10_000/(t + 10_000))) + sum(transitions.map(t => 2_500/(t + 10_000)))
 * - Note unlike affinities, this is not zero-sum.
 */

import { Affinity, AffinityTuple } from "../../core/Entity.ts";
import { currentHero, normalize, spellsheet } from "../../hero.ts";
import { currentSemcraft } from "../../semcraftContext.ts";
import { sameOwner, setFind } from "../util.ts";
import { Action, newCooldown } from "./util.ts";

const onCooldown = newCooldown(750);

const { calcSpellAffinity } = spellsheet([
  [Affinity.fire, 0.99],
  [Affinity.conjuration, 0.01],
]);

const hermite = 2 / 3 ** 0.5;

export const firebolt: Action<"firebolt"> = ({ x, y, mana }) => {
  const hero = currentHero();
  if (onCooldown(hero) || hero.mana < mana || mana < 0.1) return;

  // Calculate the affinity the hero has with the spell
  const [spellAffinity, burns] = calcSpellAffinity(hero);
  if (spellAffinity < 0.1 || hero.mana < mana) return;

  // Calculate the mana used in the spell
  const effectiveMana = mana * spellAffinity;
  const p = 2 / effectiveMana ** (1 / 3);

  hero.affinities = normalize(
    hero.affinities.map((a, i) => a + (burns[i] ** p) / 1000),
    (v, sum) => ((v ** 3) / sum) ** (1 / 3),
    (item) => item ** 3,
  ) as AffinityTuple<number>;

  hero.mana -= mana;

  const conversion = (1 / (1 - spellAffinity) - 1) * effectiveMana ** hermite;
  const fireDamage = 20 * conversion;
  const physicalDamage = 10 * conversion;

  const damage = fireDamage + physicalDamage;

  const semcraft = currentSemcraft();
  const firebolt = semcraft.add({
    name: "firebolt",
    owner: hero,
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
    timeout: {
      remaining: 4,
      callback: () => semcraft.delete(firebolt),
    },
    collision: {
      radius: 0.5,
      callback: (entities) => {
        const entity = setFind(entities, (e) => !sameOwner(e, hero));
        if (entity) {
          semcraft.delete(firebolt);
          if (typeof entity.life === "number" && entity.life > 0) {
            entity.life -= damage;
            if (entity.life <= 0) semcraft.delete(entity);
          }
        }
      },
    },
  });
};
