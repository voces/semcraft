import { SIZE } from "../../constants.ts";
import { Widget } from "../../core/Entity.ts";
import { System } from "../../core/System.ts";
import { data } from "../../util/data.ts";
import { Grid } from "../../util/Grid.ts";

const { current: currentGrid, set } = data<Grid<Widget>>();
export { currentGrid };

export const newGrid = () => {
  const grid = new Grid<Widget>(
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
