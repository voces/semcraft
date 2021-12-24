import { Affinity, AffinityTuple } from "../../core/Entity.ts";
import { currentHero, normalize, spellsheet } from "../../hero.ts";
import { currentSemcraft } from "../../semcraftContext.ts";
import { sameOwner, setFind } from "../util.ts";
import { Action, newCooldown } from "./util.ts";

const onCooldown = newCooldown(750);

const { calcSpellAffinity } = spellsheet([
  [Affinity.poison, 0.98],
  [Affinity.conjuration, 0.02],
]);

const hermite = 2 / 3 ** 0.5;

export const poisonNova: Action<"poisonNova"> = ({ x, y, mana }) => {
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
  const poisonDamage = 3 * conversion;
  const physicalDamage = 0.25 * conversion;

  const damage = poisonDamage + physicalDamage;

  const semcraft = currentSemcraft();

  const baseAngle = Math.atan2(y - hero.y, x - hero.x);
  for (let i = 0; i < 12; i++) {
    const poisonNova = semcraft.add({
      owner: hero,
      x: hero.x,
      y: hero.y,
      moveAlong: baseAngle + i * Math.PI / 6,
      art: {
        geometry: {
          type: "sphere",
          radius: 0.1,
        },
        material: {
          type: "phong",
          color: "green",
        },
      },
      speed: 3,
      timeout: {
        remaining: 4,
        callback: () => semcraft.delete(poisonNova),
      },
      collision: {
        radius: 0.4,
        callback: (entities) => {
          const entity = setFind(entities, (e) => !sameOwner(e, hero));
          if (entity) {
            semcraft.delete(poisonNova);
            if (typeof entity.life === "number" && entity.life > 0) {
              // TODO: damage is more complicated, especially poison!
              entity.life -= damage;
              if (entity.life <= 0) semcraft.delete(entity);
            }
          }
        },
      },
    });
  }
};
