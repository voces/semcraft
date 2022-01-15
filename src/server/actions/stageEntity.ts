import { Entity } from "../../core/Entity.ts";
import { Hero } from "../../hero.ts";
import { getClients } from "../node.ts";

export const stageEntity = ({ entity }: { entity: Entity }) => {
  // Only worry about heroes that are being staged
  if (!entity.isHero) return;

  const clients = getClients();

  const client = clients.get(entity.entityId);
  if (client) {
    Object.assign(client.hero, entity);
    return;
  }

  clients.set(entity.entityId, {
    hero: entity as Hero,
    knownEntities: new Set(),
  });
};
