import { Widget } from "../../core/Entity.ts";
import { Hero } from "../../hero.ts";

export type Port = MessagePort | BroadcastChannel;

export type Client = {
  hero: Hero;
  knownEntities: Set<Widget>;
};

let _client = null as unknown as Client;

export const setClient = (client: Client) => _client = client;
export const getClient = () => _client;
