import { Entity } from "../../core/Entity.ts";
import { currentSemcraft } from "../../semcraftContext.ts";

// Add "stageEntity" for when a Hero nears boundary
export const transferEntity = ({ entity }: { entity: Entity }) => {
  console.log("transfer", { ...entity });
  currentSemcraft().add(entity);
};
