import { Entity } from "../../core/Entity.ts";
import { Hero, setHero } from "../../hero.ts";
import { currentSemcraft } from "../../semcraftContext.ts";
import { getChannel, getClients } from "../node.ts";

export const transferEntity = ({ entity }: { entity: Entity }) => {
  currentSemcraft().add(entity);

  if (entity.isHero) {
    // Replace the hero on the client, as the previous hero wasn't added to the
    // app and lacks hooks
    const client = getClients().get(entity.entityId);
    if (client) {
      client.hero = entity as Hero;
      setHero(client.hero);
    }

    getChannel().postMessage({
      action: "transfer",
      client: entity.entityId,
    });
  }
};
