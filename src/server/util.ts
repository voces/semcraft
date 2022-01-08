import { WriteLogEntry } from "../core/App.ts";
import { Entity } from "../core/Entity.ts";

export const setFind = <T>(set: ReadonlySet<T>, fn: (item: T) => boolean) => {
  for (const item of set) if (fn(item)) return item;
};

export const addPoison = (entity: Entity, damage: number, duration: number) => {
  const poisons = entity.poisons;

  // First poison, new array
  if (!poisons) {
    entity.poisons = [{ damage, remaining: duration }];
    return;
  }

  let remaining = duration;
  for (let i = 0; i < poisons.length; i++) {
    if (poisons[i].damage >= damage) remaining -= poisons[i].remaining;
    if (remaining <= 0) return;

    // Existing posion, just update it
    if (poisons[i].damage === damage) {
      poisons[i].remaining += remaining;

      // Adjust remaining poisons
      for (let n = i + 1; n < poisons.length; n++) {
        poisons[n].remaining -= remaining;
        if (poisons[n].remaining <= 0) poisons.splice(n);
      }
      return;
    }

    // New poison, insert before first poison that deals less damage
    if (poisons[i].damage < damage) {
      entity.poisons = [
        ...poisons.slice(0, i - 1),
        { damage, remaining },
        // Adjust remaining poisons
        ...poisons.slice(i - 1).map(({ damage, remaining: duration }) => ({
          damage,
          remaining: duration - remaining,
        })).filter((p) => p.remaining > 0),
      ];
    }
  }

  // All existing poisons do more damage, append to end
  poisons.push({ damage, remaining });
};

const publicAttributes = [
  "art",
  "deleted",
  "entityId",
  "isTerrain",
  "moveAlong",
  "moveTo",
  "name",
  "owner",
  "speed",
  "x",
  "y",
];
const ownerAttributes = [
  "life",
  "mana",
  "maxLife",
];

export const scrub = (write: WriteLogEntry | Entity, owned: boolean) =>
  Object.fromEntries(
    Object.entries(write).filter(([k]) =>
      publicAttributes.includes(k) || (owned && ownerAttributes.includes(k))
    ),
  );
