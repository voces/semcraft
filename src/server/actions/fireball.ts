import { Affinity } from "../../core/Entity.ts";
import { currentHero, normalizeAffinities } from "../../hero.ts";
import { currentSemcraft } from "../../semcraftContext.ts";
import { currentGrid } from "../systems/grid.ts";
import { sameOwner, setFind } from "../util.ts";
import { Action, newCooldown } from "./util.ts";

const onCooldown = newCooldown(100);

export const fireball: Action<"fireball"> = (
  { x, y, fireMana: fire, conjurationMana: conjuration, splashMana: splash },
) => {
  // Verify spell can be used
  const hero = currentHero();
  const mana = fire + conjuration + splash;
  if (onCooldown(hero) || hero.mana < mana || mana < 0.1) return;

  // Adjust affinities
  hero.affinities[Affinity.fire] +=
    (fire * (1 - hero.affinities[Affinity.fire])) ** (1 / 3) / 1000;
  hero.affinities[Affinity.conjuration] +=
    (conjuration * (1 - hero.affinities[Affinity.conjuration])) ** (1 / 3) /
    1000;
  hero.affinities[Affinity.splash] +=
    (splash * (1 - hero.affinities[Affinity.splash])) ** (1 / 3) /
    1000;
  hero.affinities = normalizeAffinities(hero.affinities);

  // Calculate the mana used in the spell
  fire *= hero.affinities[Affinity.fire];
  conjuration *= hero.affinities[Affinity.conjuration];
  splash *= hero.affinities[Affinity.splash];
  hero.mana -= mana;

  // Calculate spell components
  const speed = ((fire + conjuration) / conjuration) ** 0.5 / 2;
  const physicalDamage = conjuration * (speed / 2) ** 2 * 4;
  const fireDamage = fire * 10;
  const damage = physicalDamage + fireDamage;
  const size = conjuration ** 0.2 / 2 + splash ** 0.2 / 10;
  const duration = fire ** 0.1 + conjuration ** 0.2 * 6;
  const splashRadius = 5 * splash ** 0.3;

  const semcraft = currentSemcraft();
  const fireball = semcraft.add({
    owner: hero,
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
        color: "red",
      },
    },
    speed,
    timeout: {
      remaining: duration,
      callback: () => semcraft.delete(fireball),
    },
    collision: {
      radius: size + 0.5,
      callback: (entities) => {
        const entity = setFind(entities, (e) => !sameOwner(e, hero));
        if (!entity) return;

        semcraft.delete(fireball);
        const r2 = splashRadius ** 2;
        const targets = currentGrid().queryPoint(
          entity.x,
          entity.y,
          splashRadius,
        );

        for (const entity of targets) {
          if (sameOwner(entity, hero)) continue;
          if (typeof entity.life === "number" && entity.life > 0) {
            const distance = (entity.y - fireball.y!) ** 2 +
              (entity.x - fireball.x!) ** 2;
            entity.life -= damage * (1 - (distance / r2));
            if (entity.life <= 0) semcraft.delete(entity);
          }
        }
      },
    },
  });
};
