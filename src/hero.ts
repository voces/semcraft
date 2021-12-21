import { Entity } from "./core/Entity.ts";
import { data } from "./util/data.ts";

const { current: currentHero, set: setHero } = data<Entity>();
export { currentHero, setHero };
