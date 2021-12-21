import { Entity } from "./Entity.ts";

export type System<Props extends keyof Entity> = {
  /**
   * Properties of entities the system is interested in. Required for systems
   * to have entities.
   */
  props?: readonly Props[];

  /** Invoked when an entity is added to the system. */
  onAdd?: (entity: Entity & Required<Pick<Entity, Props>>) => void;

  /** Invoked when an entity is removed from the system. */
  onRemove?: (entity: Entity) => void;

  /**
   * Invoked each time one of the system-tracked properties of an entity is
   * modified.
   */
  onChange?: (entity: Entity & Required<Pick<Entity, Props>>) => void;

  /** Invoked each logical clock update. */
  update?: (delta: number, time: number) => void;

  /** Invoked each logical clock update for each child of the system. */
  updateChild?: (
    child: Entity & Required<Pick<Entity, Props>>,
    delta: number,
    time: number,
  ) => void;

  /** Invoked each render. */
  render?: (delta: number, time: number) => void;

  /** Invoked each render for each child of the system. */
  renderChild?: (
    child: Entity & Required<Pick<Entity, Props>>,
    delta: number,
    time: number,
  ) => void;
};
