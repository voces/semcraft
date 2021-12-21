import { Entity } from "../core/Entity.ts";
import { System } from "../core/System.ts";
import { data } from "../util/data.ts";
import { Grid } from "../util/Grid.ts";
import { SIZE } from "./tiles.ts";

const { current: currentGrid, set } = data<
  Grid<Entity & { x: number; y: number }>
>();
export { currentGrid };

export const grid = () => {
  const grid = new Grid<Entity & { x: number; y: number }>(
    -SIZE / 2,
    SIZE / 2,
    SIZE / 8,
  );
  set(grid);

  return {
    props: ["x", "y"],
    onAdd: (entity) => grid.add(entity),
    // deno-lint-ignore no-explicit-any
    onRemove: (entity) => grid.delete(entity as any),
    onChange: (entity) => grid.update(entity),
  } as System<"x" | "y">;
};
