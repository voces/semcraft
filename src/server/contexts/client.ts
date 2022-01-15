import { Widget } from "../../core/Entity.ts";
import { Hero } from "../../hero.ts";

export type Port = MessagePort | BroadcastChannel;

export type Client = {
  hero: Hero;
  knownEntities: Set<Widget>;
};
