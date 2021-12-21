import { Widget } from "../../core/Entity.ts";
import { System } from "../../core/System.ts";
import { currentGrid } from "./grid.ts";

export const collision = () => {
  const grid = currentGrid();

  return {
    props: ["collision", "x", "y"],
    updateChild: (entity) => {
      const entities = new Set<Widget>();
      for (
        const widget of grid.queryPoint(
          entity.x,
          entity.y,
          entity.collision.radius,
        )
      ) {
        if (!widget.isTerrain && widget !== entity) entities.add(widget);
      }

      if (entities.size > 0) entity.collision.callback(entities);
    },
  } as System<"collision" | "x" | "y">;
};
