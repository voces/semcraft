import { Affinity, AffinityTuple } from "../../core/Entity.ts";
import { currentHero, normalize, spellsheet } from "../../hero.ts";
import { currentSemcraft } from "../../semcraftContext.ts";
import { currentGrid } from "../systems/grid.ts";
import { sameOwner, setFind } from "../util.ts";
import { Action, newCooldown } from "./util.ts";

const onCooldown = newCooldown(750);

const { calcSpellAffinity } = spellsheet([
  [Affinity.fire, 0.78],
  [Affinity.conjuration, 0.02],
  [Affinity.splash, 0.2],
]);

const hermite = 2 / 3 ** 0.5;

export const fireball: Action<"fireball"> = ({ x, y, mana }) => {
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
  const fireDamage = 15 * conversion;
  const physicalDamage = 6 * conversion;

  const damage = fireDamage + physicalDamage;

  const semcraft = currentSemcraft();
  const fireball = semcraft.add({
    owner: hero,
    x: hero.x,
    y: hero.y,
    moveAlong: Math.atan2(y - hero.y!, x - hero.x!),
    art: {
      geometry: {
        type: "sphere",
        radius: 0.25,
      },
      material: {
        type: "phong",
        color: "red",
      },
    },
    speed: 4,
    timeout: {
      remaining: 4,
      callback: () => semcraft.delete(fireball),
    },
    collision: {
      radius: 0.75,
      callback: (entities) => {
        const entity = setFind(entities, (e) => !sameOwner(e, hero));
        if (!entity) return;

        semcraft.delete(fireball);
        const targets = currentGrid().queryPoint(entity.x, entity.y, 2.5);
        for (const entity of targets) {
          if (sameOwner(entity, hero)) continue;
          if (typeof entity.life === "number" && entity.life > 0) {
            entity.life -= damage;
            if (entity.life <= 0) semcraft.delete(entity);
          }
        }
      },
    },
  });
};
