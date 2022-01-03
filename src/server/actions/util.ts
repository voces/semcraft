import type { ClientActions } from "../../client/actions/index.ts";
import { Affinity, Entity } from "../../core/Entity.ts";
import { currentHero, Hero, normalizeAffinities } from "../../hero.ts";

export type Action<T extends keyof ClientActions> = (
  action: NonNullable<Awaited<ReturnType<ClientActions[T]["handle"]>>>,
) => void;

export const newRateLimit = (cooldown: number) => {
  const lasts = new WeakMap<Entity, number>();
  return (entity = currentHero()) => {
    const now = Date.now();
    const last = lasts.get(entity) ?? -Infinity;
    if (now - last < cooldown) return true;
    lasts.set(entity, now);
    return false;
  };
};

export const commonRuneLogic = (
  ...affinities: Affinity[]
): [(hero: Hero) => boolean, (hero: Hero, ...manas: number[]) => number[]] => {
  return [(hero) => {
    if (hero.lockout) return true;

    let sum = 0;
    for (const affinity of affinities) {
      sum += 5_000 / (10_000 + hero.counts[affinity]);
    }

    hero.lockout = sum;

    console.log(sum);

    return false;
  }, (hero: Hero, ...manas: number[]) => {
    const final = manas.map((m, i) => m * hero.affinities[affinities[i]]);

    for (let i = 0; i < manas.length; i++) {
      hero.affinities[affinities[i]] +=
        (manas[i] * (1 - hero.affinities[i])) ** (1 / 3) / 1000;
      hero.counts[affinities[i]]++;
    }
    hero.affinities = normalizeAffinities(hero.affinities);

    return final;
  }];
};
