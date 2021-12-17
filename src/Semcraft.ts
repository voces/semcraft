import { Entity, newApp, newEntity } from "./proxyecs.ts";
import { logic } from "./systems/logic.ts";
import { three } from "./systems/three.ts";

export class Semcraft implements Entity {
  // These are all defined by newApp/newEntity
  add!: (entity: Entity) => void;
  children!: ReadonlySet<Entity>;
  childPropMap!: Readonly<Partial<Record<keyof Entity, ReadonlyArray<Entity>>>>;
  update!: () => void;
  render!: () => void;

  constructor(canvas: HTMLCanvasElement) {
    newApp(newEntity(this));
    withSemcraft(this, () => {
      this.add(three(canvas));
      this.add(logic());
    });
  }
}

let context: Semcraft;
export const withSemcraft = <T>(semcraft: Semcraft, fn: () => T) => {
  const oldContext = context;
  context = semcraft;
  const ret = fn();
  context = oldContext;
  return ret;
};

export const currentSemcraft = () => context;
