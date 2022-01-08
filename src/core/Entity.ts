import type { ColorRepresentation, Mesh } from "three";
import { Client } from "../server/contexts/client.ts";
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
  space: T,
  speed: T,
];

export enum Affinity {
  fire = 0,
  /** Frost/cold. */
  frost,
  lightning,
  poison,
  /** Physical/kinetic. */
  physical,
  /** Light/holy. */
  light,
  /** Life/death. */
  life,
  /** Pure mana, such as for generic shields or regeneration. */
  mana,
  /** Conjuration/creation */
  conjuration,
  /** Animation (skeletons, conjurations, etc). */
  animate,
  /** Relating to physical space. */
  space,
  /** Spread capability. Think radiuses. */
  splash,
  /** Enhancing a target, such as one self, a weapon, an ally, or enemy. */
  enhance,
  /** Meta affinity for when a spell is used passively (auras). */
  passive,
  /** Meta affinity for when a spell has a long term duration (enchant). */
  buff,
}

export const affinityCount = Affinity.buff;

export type DecisionTree = {
  check: (entity: Entity) => string;
  [branch: string]: DecisionTree | ((entity: Entity) => void);
};

export type Entity = {
  entityId: string;

  /** User visible name of the entity. */
  name?: string;

  /** x position of the entity. */
  x?: number;

  /** y position of the entity. */
  y?: number;

  /** The max life of the entity. */
  maxLife?: number;

  /**
   * Remaining seconds before the entity can perform another action. This could
   * be due to just casting a spell, attacking, being knockbacked, stunned, or
   * a plethora of other things.
   */
  lockout?: number;

  attackTarget?: Widget;

  /** Description of the entity's basic attack. */
  attack?: {
    /**
     * How far away other entities can be, exclusive of either entity's radius.
     */
    range: number;

    /**
     * Base physical damage from attack, before application of modifiers from
     * spells or items
     */
    damage: number;

    /**
     * Base cooldown period between attacks, before application of modifiers
     * from spells or items.
     */
    cooldown: number;
  };

  /**
   * The life of the entity. Regenerates 1% of missing life a second (0.1
   * minimum). Requires maxLife to be set.
   */
  life?: number;

  /** The mana of the entity. Regenerates 1/s, but caps at entity's life. */
  mana?: number;

  /** The affinity the entity has with each rune. */
  affinities?: AffinityTuple<number>;

  /** The number of times the entity has used each rune. */
  counts?: AffinityTuple<number>;

  /** Poisons the entity is inflicted with. */
  poisons?: { damage: number; remaining: number }[];

  /** The entity that created this entity (e.g., firebolt, summon). */
  owner?: Entity["entityId"];

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
  mesh?: Mesh;

  /** The movement speed of the entity. */
  speed?: number;

  /** A point the entity will be moved towards. */
  moveTo?: { x: number; y: number };

  /** A direction, in radians, an entity will be moved along. */
  moveAlong?: number;

  /** Count of player entities that see this entity. */
  active?: number;

  /** Give the entity automated actions. */
  ai?: DecisionTree;

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

  /** A reference to an actual client, indicating the entity is a Hero. */
  client?: Client;

  /**
   * A callback that is called before the entity is deleted. If the callback
   * returns false, the entity is not deleted.
   */
  beforeDelete?: (entity: Entity) => void | boolean;

  /** Flag for hero entity. */
  isHero?: boolean;
};

/** An entity with a position. */
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
      if (changed) app.onEntityPropChange(entity, prop);
    },
    ...propertyDescriptor,
  });
};

export const newEntity = (partialEntity: Partial<Entity>) => {
  const entity = partialEntity as Entity;
  Object.defineProperty(entity, "isEntity", { value: true });
  if (entity.owner === undefined) entity.owner = entity.entityId;

  trackProp(entity, "active");
  trackProp(entity, "art");
  trackProp(entity, "attackTarget");
  trackProp(entity, "isTerrain");
  trackProp(entity, "life");
  trackProp(entity, "lockout");
  trackProp(entity, "mana");
  trackProp(entity, "mesh");
  trackProp(entity, "moveAlong");
  trackProp(entity, "moveTo");
  trackProp(entity, "poisons");
  trackProp(entity, "speed");
  trackProp(entity, "timeout");
  trackProp(entity, "x");
  trackProp(entity, "y");

  return entity;
};
