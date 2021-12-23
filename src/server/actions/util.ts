import type { ClientActions } from "../../client/actions/index.ts";
import { Entity } from "../../core/Entity.ts";
import { currentHero } from "../../hero.ts";

export type Action<T extends keyof ClientActions> = (
  action: NonNullable<Awaited<ReturnType<ClientActions[T]["handle"]>>>,
) => void;

export const newCooldown = (cooldown: number) => {
  const lasts = new WeakMap<Entity, number>();
  return (entity = currentHero()) => {
    const now = Date.now();
    const last = lasts.get(entity) ?? -Infinity;
    if (now - last < cooldown) return true;
    lasts.set(entity, now);
    return false;
  };
};
