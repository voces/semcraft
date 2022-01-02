import { SIZE } from "../constants.ts";
import { GridMap } from "../util/GridMap.ts";
import { Entity, newEntity } from "./Entity.ts";
import { System } from "./System.ts";

export type WriteLogEntry = Partial<Entity> & {
  entityId: number;
  x: number;
  y: number;
  deleted?: true;
};

export type App = {
  /** Invoked each update. */
  update: (fn: (grid: GridMap<Entity, WriteLogEntry>) => void) => void;

  onEntityPropChange: <Property extends keyof Entity>(
    entity: Entity,
    property: Property,
  ) => void;

  /** Remove the entity from the app and all systems. */
  delete: (entity: Entity) => void;

  /** Add an entity to the App. */
  add: (partial: Partial<Entity>) => Entity;

  /** Add a system to the App. */
  addSystem: <K extends keyof Entity>(partial: System<K>) => System<K>;

  /** Remove a system from the App. */
  deleteSystem: <K extends keyof Entity>(system: System<K>) => void;

  /** Apply updates from writelogs (return of update). */
  patch: (writes: WriteLogEntry[]) => void;
};

export const newApp = (partialApp: Partial<App>): App => {
  const app = partialApp as App;

  const systems = new Set<System<keyof Entity>>();

  const writeLog = new GridMap<Entity, WriteLogEntry>(
    -SIZE / 2,
    SIZE / 2,
    SIZE / 8,
  );
  Object.defineProperty(globalThis, "writeLog", {
    value: writeLog,
    configurable: true,
  });

  const childPropMap: Partial<Record<keyof Entity, System<keyof Entity>[]>> =
    {};

  let entityId = 0;
  const entities: Record<number, Entity> = {};

  const systemsEntities = new Map<System<keyof Entity>, Set<Entity>>();

  if (!app.update) {
    let lastUpdate = Date.now() / 1000;
    app.update = (fn) => {
      const next = Date.now() / 1000;
      const delta = next - lastUpdate;
      lastUpdate = next;

      for (const system of systems) {
        system.update?.(delta, next);

        const entities = systemsEntities.get(system);
        if (system.updateChild && entities) {
          for (const child of entities) {
            // deno-lint-ignore no-explicit-any
            system.updateChild(child as any, delta, next);
          }
        }
      }

      fn(writeLog);

      writeLog.clear();
    };
  }

  if (!app.delete) {
    app.delete = (child) => {
      if (child.beforeDelete?.(child) === false) return;

      for (const system of systems) {
        const entities = systemsEntities.get(system);
        if (entities?.has(child)) {
          entities.delete(child);
          system.onRemove?.(child);
        }
      }

      delete entities[child.entityId];

      if (typeof child.x === "number" && typeof child.y === "number") {
        writeLog.set(child, {
          entityId: child.entityId!,
          x: child.x,
          y: child.y,
          deleted: true,
        });
      }
    };
  }

  if (!app.onEntityPropChange) {
    app.onEntityPropChange = (entity, property) => {
      // Update write log
      if (writeLog.has(entity)) {
        writeLog.patch(entity, { [property]: entity[property] });
      } else if (typeof entity.x === "number" && typeof entity.y === "number") {
        writeLog.set(entity, {
          entityId: entity.entityId,
          x: entity.x,
          y: entity.y,
          // TODO: this could be a bug if property is x/y and the value is null
          // or undefined. But why would that ever happen?
          [property]: entity[property],
        });
      }

      const systems = childPropMap[property as keyof Entity];
      if (systems) {
        for (const system of systems) {
          const entities = systemsEntities.get(system);

          // Fast path: mutating a single value and other values are good
          if (entities?.has(entity)) {
            // Just a mutation
            if (entity[property] != null) {
              // deno-lint-ignore no-explicit-any
              system.onChange?.(entity as any);

              // We nulled a required prop
            } else {
              entities.delete(entity);
              system.onRemove?.(entity);
            }

            continue;
          }

          // Slow path; we might need to add the entity to the system, so we
          // must check all required props
          const next = system.props?.every((prop: keyof Entity) =>
            entity[prop] != null
          ) ??
            false;
          if (next) {
            entities?.add(entity);
            // deno-lint-ignore no-explicit-any
            system.onAdd?.(entity as any);
          }
        }
      }
    };
  }

  if (!app.add) {
    app.add = (partialEntity) => {
      // Allow direct adding of plain objects
      const entity = "isEntity" in partialEntity
        ? partialEntity as Entity
        : newEntity(
          Object.assign(partialEntity, {
            entityId: partialEntity.entityId ?? (entityId++),
          }),
        );

      entities[entity.entityId] = entity;

      // Update write log
      if (typeof entity.x === "number" && typeof entity.y === "number") {
        // deno-lint-ignore no-explicit-any
        writeLog.set(entity, { ...entity } as any);
      }

      // Add entity to existing systems
      const systems = Object.keys(entity).flatMap((prop) =>
        childPropMap[prop as keyof Entity]
      );
      for (const system of systems) {
        if (system) {
          const entities = systemsEntities.get(system);
          if (
            entities && system.props?.every((prop) => entity[prop] != null)
          ) {
            entities.add(entity);
            // deno-lint-ignore no-explicit-any
            system.onAdd?.(entity as any);
          }
        }
      }

      return entity;
    };
  }

  if (!app.addSystem) {
    app.addSystem = <K extends keyof Entity>(partialSystem: System<K>) => {
      // Allow direct adding of plain objects
      const system = partialSystem as System<keyof Entity>;
      const systemEntities = new Set<Entity>();
      systemsEntities.set(system, systemEntities);

      // System has children;
      if (system.props) {
        for (const prop of system.props) {
          if (!childPropMap[prop]) childPropMap[prop] = [];
          childPropMap[prop]!.push(system);
        }

        // Add existing matching children
        for (const entityId in entities) {
          const entity = entities[entityId];
          if (system.props.every((prop) => entity[prop] != null)) {
            systemEntities.add(entity);
            // deno-lint-ignore no-explicit-any
            system.onAdd?.(entity as any);
          }
        }
      }

      systems.add(system);

      return system as System<K>;
    };
  }

  if (!app.deleteSystem) {
    app.deleteSystem = (system) => {
      systemsEntities.delete(system as System<keyof Entity>);

      if (system.props) {
        for (const prop of system.props) {
          const systems = childPropMap[prop];
          if (systems) {
            const index = systems.indexOf(system as System<keyof Entity>);
            if (index >= 0) systems.splice(index);
          }
        }
      }

      systems.delete(system as System<keyof Entity>);
    };
  }

  if (!app.patch) {
    app.patch = (patches) => {
      for (const patch of patches) {
        // Existing entity
        if (patch.entityId in entities) {
          // That's deleted
          if (patch.deleted) app.delete(entities[patch.entityId]);
          // Otherwise just update it
          else Object.assign(entities[patch.entityId], patch);
          // Non-existing entity that isn't being deleted
        } else if (!patch.deleted) app.add(patch);
      }
    };
  }

  return app;
};
