import { Widget } from "../../core/Entity.ts";
import { Hero } from "../../hero.ts";

export type Client = {
  port: MessagePort;
  hero: Hero;
  knownEntities: Set<Widget>;
  close: () => void;
};

let _client = null as unknown as Client;

export const setClient = (client: Client) => _client = client;
export const getClient = () => _client;
