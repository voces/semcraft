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
import { currentHero } from "../../hero.ts";
import { Action, commonRuneLogic } from "./util.ts";

const [onCooldown, updateAffinities] = commonRuneLogic(
  Affinity.space,
);

export const teleport: Action<"teleport"> = (
  { x, y, spaceMana: space },
) => {
  // Verify spell can be used
  const hero = currentHero();
  let mana = space;
  if (hero.mana < mana || mana < 0.1 || onCooldown(hero)) return;

  // TODO: offload this logic to client and instead just have client send
  // spaceMana and angle?
  // MAYBE: an alternative to mana + angle would just be the amount of mana
  // determines the precision of the teleport
  const desiredDistance = ((x - hero.x) ** 2 + (y - hero.y) ** 2) ** 0.5;
  const requiredMana = (desiredDistance / 10) ** 2 /
    hero.affinities[Affinity.space];
  console.log({ desiredDistance, requiredMana, mana });
  if (requiredMana < mana) {
    space = mana = requiredMana;
  }

  // Update affinities and get final manas
  [space] = updateAffinities(hero, space);
  hero.mana -= mana;

  // Calculate spell components
  const maxDistance = space ** 0.5 * 10;
  const finalDistance = Math.min(maxDistance, desiredDistance);
  const angle = Math.atan2(y - hero.y, x - hero.x);
  console.log({ maxDistance, finalDistance, angle });

  hero.x += finalDistance * Math.cos(angle);
  hero.y += finalDistance * Math.sin(angle);

  if (hero.moveTo) hero.moveTo = undefined;
};
