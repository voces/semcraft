import { Entity, newApp, newEntity } from "./proxyecs.ts";

export class Semcraft implements Entity {
  add!: (entity: Entity) => void;
  children!: ReadonlyArray<Entity>;
  childPropMap!: Readonly<Partial<Record<keyof Entity, ReadonlyArray<Entity>>>>;

  constructor() {
    newApp(newEntity(this));
  }
}
