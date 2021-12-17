import { Object3D } from "three";

export type Entity = {
  /////////////////////////////////////////////////////////////////////////////
  // Base entities
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Flag to ensure entities are passed through newEntity
   */
  isEntity?: true;

  /**
   * Parent of the entity.
   */
  parent?: Entity;

  /////////////////////////////////////////////////////////////////////////////
  // Sprite
  /////////////////////////////////////////////////////////////////////////////

  /**
   * x position of the entity.
   */
  x?: number;

  /**
   * y position of the entity.
   */
  y?: number;

  mesh?: Object3D;

  target?: Entity;

  /////////////////////////////////////////////////////////////////////////////
  // Systems
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Add a child to the system.
   */
  add?: (entity: Entity) => void;

  /**
   * Children of the system.
   */
  children?: ReadonlySet<Entity>;

  /**
   * A map of entity keys to systems.
   */
  childPropMap?: Readonly<Partial<Record<keyof Entity, ReadonlyArray<Entity>>>>;

  /**
   * Properties of entities the system is interested in. Required for systems
   * to have entities.
   */
  props?: readonly (keyof Entity)[];

  /**
   * Test whether an entity should be in the system. Invoked each time an
   * entity in `parent.children` sees a property in `props` set. Required for
   * systems to have entities.
   */
  test?: (entity: Entity) => boolean;

  /**
   * Invoked when an entity is added to the system.
   */
  onAdd?: (entity: Entity) => void;

  /**
   * Invoked when an entity is removed from the system.
   */
  onRemove?: (entity: Entity) => void;

  /**
   * Invoked each time `test`
   */
  onChange?: (entity: Entity) => void;

  /**
   * Invoked each logical clock update.
   */
  update?: (delta: number, time: number) => void;

  /**
   * Invoked each logical clock update for each child of the system.
   */
  updateChild?: (child: Entity, delta: number, time: number) => void;

  /**
   * Invoked each render.
   */
  render?: (delta: number, time: number) => void;

  /**
   * Invoked each render for each child of the system.
   */
  renderChild?: (child: Entity, delta: number, time: number) => void;

  /////////////////////////////////////////////////////////////////////////////
  // App
  /////////////////////////////////////////////////////////////////////////////

  /**
   * The systems of the app. Automatically appended to when adding an entity
   * with system properties.
   */
  systems?: ReadonlyArray<Entity>;
};

class Set2 extends Set {
  toJSON() {
    return Array.from(this);
  }
}

let directAdd = true;

export const newEntity = (
  entity?: Partial<Entity>,
) => {
  const mutableEntity = (entity ?? {}) as ({
    isEntity: true;
    children?: Set<Entity>;
    childPropMap?: Partial<Record<keyof Entity, Entity[]>>;
    add?: (entity: Entity) => void;
    systems?: Entity[];
  });

  Object.defineProperty(mutableEntity, "isEntity", { value: true });

  if (!mutableEntity.add) {
    mutableEntity.add = (child: Entity) => {
      // Ensure other props are defined
      if (!mutableEntity.children) mutableEntity.children = new Set2();
      if (!mutableEntity.childPropMap) {
        Object.defineProperty(mutableEntity, "childPropMap", {
          value: {},
          enumerable: false,
        });
      }

      if (!child.isEntity) newEntity(child);

      // Set parent if .add was called remotely
      if (directAdd) {
        Object.defineProperty(child, "parent", { value: publicEntity });
      }

      // Register system optimization map
      if (child.props) {
        for (const prop of child.props) {
          if (!mutableEntity.childPropMap?.[prop]) {
            mutableEntity.childPropMap![prop] = [];
          }
          mutableEntity.childPropMap?.[prop]?.push(child);
        }
      }

      // Register system and add existing matching children
      if (child.props || child.update || child.render) {
        if (!mutableEntity.systems) mutableEntity.systems = [];
        mutableEntity.systems.push(child);

        if (mutableEntity.children && child.test && child.add) {
          directAdd = false;
          for (const child2 of mutableEntity.children) {
            if (child.test(child2)) {
              child.add(child2);
              child.onAdd?.(child2);
            }
          }
          directAdd = true;
        }
      }

      // Actually add the child
      mutableEntity.children?.add(child);

      // Add entity to child systems
      const keys = Object.keys(child) as (keyof Entity)[];
      const systems = new Set(
        keys.flatMap((key) => mutableEntity.childPropMap?.[key] ?? []),
      );

      directAdd = false;
      for (const system of systems) {
        if (system.test?.(child)) {
          system.add?.(child);
          system.onAdd?.(child);
        }
      }
      directAdd = true;
    };
  }

  const publicEntity = new Proxy(mutableEntity as Entity, {
    set: (target, property, value) => {
      target[property as keyof Entity] = value;

      // Notify systems of entity changes
      if (target.parent) {
        const systems = target.parent.childPropMap?.[property as keyof Entity];
        if (systems) {
          for (const system of systems) {
            const prev = system.children?.has(target) ?? false;
            const next = system.test?.(target) ?? false;
            if (prev && next) system.onChange?.(target);
            else if (prev && !next) {
              (system.children! as Set<Entity> | undefined)?.delete(target);
              system.onRemove?.(target);
            } else if (!prev && next) {
              system.add?.(target);
              system.onAdd?.(target);
            }
          }
        }
      }

      return true;
    },
  });

  return publicEntity;
};

export const newApp = (entity: Entity) => {
  let lastUpdate = Date.now();
  entity.update = () => {
    const next = Date.now();
    const delta = next - lastUpdate;
    lastUpdate = next;

    if (entity.systems) {
      for (const system of entity.systems) {
        system.update?.(delta, next);

        if (entity.children) {
          for (const child of entity.children) {
            system.updateChild?.(child, delta, next);
          }
        }
      }
    }
  };

  let lastRender = Date.now();
  entity.render = () => {
    const next = Date.now();
    const delta = next - lastRender;
    lastRender = next;

    if (entity.systems) {
      for (const system of entity.systems) {
        system.render?.(delta, next);

        if (entity.children) {
          for (const child of entity.children) {
            system.renderChild?.(child, delta, next);
          }
        }
      }
    }
  };
};
