import { Affinity } from "../../core/Entity.ts";
import { currentHero } from "../../hero.ts";
import { currentSemcraft } from "../../semcraftContext.ts";
import { addPoison, setFind } from "../util.ts";
import { Action, commonRuneLogic } from "./util.ts";

const [onCooldown, updateAffinities] = commonRuneLogic(
  Affinity.poison,
  Affinity.conjuration,
);

export const poisonNova: Action<"poisonNova"> = (
  { x, y, poisonMana: poison, conjurationMana: conjuration },
) => {
  // Verify spell can be used
  const hero = currentHero();
  const mana = poison + conjuration;
  if (hero.mana < mana || mana < 0.1 || onCooldown(hero)) return;

  // Update affinities and get final manas
  [poison, conjuration] = updateAffinities(hero, poison, conjuration);
  hero.mana -= mana;

  // Calculate spell components
  const bolts = 12;
  const speed = ((poison + conjuration) / conjuration) ** 0.5 / 2;
  const physicalDamage = (conjuration * (speed / 2) ** 2 * 4) / bolts ** 0.5;
  const poisonDamage = (poison * 10) / bolts ** 0.5;
  const size = (conjuration ** 0.2 / 2) / bolts ** 0.5;
  const boltDuration = (poison ** 0.1 + conjuration ** 0.2 * 6) /
    bolts ** 0.5;
  const duration = (poison ** 0.3 * 50 + conjuration ** 0.1) / bolts ** 0.5;

  const semcraft = currentSemcraft();

  const baseAngle = Math.atan2(y - hero.y, x - hero.x);
  for (let i = 0; i < bolts; i++) {
    const poisonNova = semcraft.add({
      owner: hero.entityId,
      x: hero.x,
      y: hero.y,
      moveAlong: baseAngle + i * Math.PI / 6,
      art: {
        geometry: {
          type: "sphere",
          radius: size,
        },
        material: {
          type: "phong",
          color: "green",
        },
      },
      speed,
      timeout: {
        remaining: boltDuration,
        callback: () => semcraft.delete(poisonNova),
      },
      collision: {
        radius: size + 0.5,
        callback: (entities) => {
          const entity = setFind(entities, (e) => e.owner !== poisonNova.owner);
          if (entity) {
            semcraft.delete(poisonNova);
            if (typeof entity.life === "number" && entity.life > 0) {
              entity.life -= physicalDamage;
              if (entity.life > 0) addPoison(entity, poisonDamage, duration);
            }
          }
        },
      },
    });
  }
};
