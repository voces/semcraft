import { System } from "../../core/System.ts";
import { currentSemcraft } from "../../semcraftContext.ts";

export const newDeathSystem = () => {
  const semcraft = currentSemcraft();
  return {
    props: ["life"],
    onChange: (entity) => {
      if (entity.life > 0) return;
      semcraft.delete(entity);
    },
  } as System<"life">;
};
