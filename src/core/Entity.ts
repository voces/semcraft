import type { ColorRepresentation, Object3D } from "three";
import { currentApp } from "./appContext.ts";

export type Entity = {
  entityId: number;

  /** x position of the entity. */
  x?: number;

  /** y position of the entity. */
  y?: number;

  /**
   * The life of the entity.
   */
  life?: number;

  /**
   * The mana of the entity.
   */
  mana?: number;

  /**
   * The affinity the entity has with each rune.
   */
  affinities?: number[];

  /**
   * The number of times the entity has used each rune.
   */
  counts?: number[];

  /**
   * The number of times the entity has transitioned between each rune.
   */
  transitions?: number[][];

  /**
   * The entity that created this entity (e.g., firebolt, summon).
   */
  source?: Entity;

  /** Describes the mesh to be generated */
  art?: {
    geometry?: { type: "plane" } | { type: "sphere"; radius?: number };
    material?: { type: "tile"; index: number } | {
      type: "phong";
      color?: ColorRepresentation;
    };
  };

  /** Three.js mesh. This is not a detectable property of the entity. */
  mesh?: Object3D;

  /** The movement speed of the entity. */
  speed?: number;

  /** A point the entity will be moved towards. */
  moveTo?: { x: number; y: number };

  /** A direction, in radians, an entity will be moved along. */
  moveAlong?: number;

  /**
   * Seconds remaining until callback is invoked. Note the callback has to
   * handle cleaning out the timeout.
   */
  timeout?: number;

  /**
   * A function that will be invoked when timeout reaches zero. Note the
   * callback has to handle cleaning out the timeout.
   */
  callback?: () => void;

  /** A flag to mark the entity as a piece of terrain. */
  isTerrain?: boolean;
};

const trackProp = <Prop extends keyof Entity>(
  entity: Entity,
  prop: Prop,
  propertyDescriptor?: PropertyDescriptor,
) => {
  let value: Entity[Prop] | undefined = entity[prop];
  const app = currentApp();
  Object.defineProperty(entity, prop, {
    enumerable: true,
    get: () => value,
    set: (newValue) => {
      const changed = newValue !== value;
      value = newValue;
      if (changed) app.onEntityPropChange(entity, prop, newValue);
    },
    ...propertyDescriptor,
  });
};

export const newEntity = (partialEntity: Partial<Entity>) => {
  const entity = partialEntity as Entity;
  Object.defineProperty(entity, "isEntity", { value: true });

  trackProp(entity, "x");
  trackProp(entity, "y");
  trackProp(entity, "life");
  trackProp(entity, "mesh");
  trackProp(entity, "isTerrain");
  trackProp(entity, "speed");
  trackProp(entity, "moveTo");
  trackProp(entity, "moveAlong");
  trackProp(entity, "timeout");
  trackProp(entity, "callback");
  trackProp(entity, "art");

  return entity;
};
