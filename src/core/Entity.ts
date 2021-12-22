import type { ColorRepresentation, Object3D } from "three";
import { currentApp } from "./appContext.ts";

export type AffinityTuple<T> = [
  fire: T,
  frost: T,
  lightning: T,
  poison: T,
  physical: T,
  light: T,
  life: T,
  mana: T,
  conjuration: T,
  animate: T,
  splash: T,
  enhance: T,
  passive: T,
  buff: T,
  speed: T,
];

export enum Affinity {
  fire = 0,
  frost,
  lightning,
  poison,
  physical,
  light,
  life,
  mana,
  conjuration,
  animate,
  splash,
  enhance,
  passive,
  buff,
  speed,
}

export type Entity = {
  entityId: number;

  /** User visible name of the entity. */
  name?: string;

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
  affinities?: AffinityTuple<number>;

  /**
   * The number of times the entity has used each rune.
   */
  counts?: AffinityTuple<number>;

  /**
   * The number of times the entity has transitioned between each rune.
   */
  transitions?: AffinityTuple<AffinityTuple<number>>;

  /**
   * The entity that created this entity (e.g., firebolt, summon).
   */
  owner?: Entity;

  /** Describes the mesh to be generated */
  art?: {
    geometry?:
      | { type: "plane" }
      | { type: "cylinder" }
      | { type: "sphere"; radius?: number };
    material?:
      | { type: "tile"; index: number }
      | { type: "phong"; color?: ColorRepresentation };
  };

  /** Three.js mesh. This is not a detectable property of the entity. */
  mesh?: Object3D;

  /** The movement speed of the entity. */
  speed?: number;

  /** A point the entity will be moved towards. */
  moveTo?: { x: number; y: number };

  /** A direction, in radians, an entity will be moved along. */
  moveAlong?: number;

  /** Like setTimeout, but via the Entity-Component-System. */
  timeout?: {
    /** Seconds remaining until callback is invoked. */
    remaining: number;
    /** Function that will be invoked when remaining hits zero. */
    callback: () => void;
  };

  /** Detect nearby entities and invoke a callback. */
  collision?: {
    /** Distance other entities will be found, origin to origin. */
    radius: number;
    /**
     * Callback that will be invoked. Will be invoked with all nearby entities,
     * but only if at least one is found.
     */
    callback: (entities: ReadonlySet<Widget>) => void;
  };

  /** A flag to mark the entity as a piece of terrain. */
  isTerrain?: boolean;

  /** A callback that is called before the entity is deleted. */
  beforeDelete?: () => void;
};

export type Widget = Entity & { x: number; y: number };

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
  trackProp(entity, "art");

  return entity;
};
