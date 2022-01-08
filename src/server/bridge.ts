// deno-lint-ignore-file no-explicit-any
import { SIZE } from "../constants.ts";
import { Hero, newHero } from "../hero.ts";
import { isArray, isRecord } from "../typeguards.ts";
import { Port } from "./contexts/client.ts";
import { scrub } from "./util.ts";

type ServerNode = {
  broadcastChannel: BroadcastChannel;
  clients: number;
};

type Client = {
  hero: Hero;
  port: Port;
  close: () => void;
  node?: BroadcastChannel;
};

const nodes: Record<string, ServerNode> = {};
const clients: Record<string, Client | undefined> = {};

const getCell = ({ x, y }: { x: number; y: number }) => ({
  x: Math.floor((x + (SIZE / 2)) / SIZE),
  y: Math.floor((y + (SIZE / 2)) / SIZE),
});

// TODO: This is just type casting a general shape and is NOT SAFE
const isAction = <T extends Record<string, unknown> & { action: string }>(
  message: unknown,
): message is T =>
  typeof message === "object" &&
  !!message &&
  "action" in message &&
  typeof (message as any).action === "string";

const handleMessage = (data: unknown, node: ServerNode, client?: Client) => {
  if (isArray(data)) {
    const writeMap = data[0] as Record<string, unknown>;
    const clientMap = data[1] as Record<string, string[]>;
    for (const clientId in clientMap) {
      const client = clients[clientId];
      if (!client) continue;
      client.port.postMessage(clientMap[clientId].map((w) => writeMap[w]));
    }
  }

  if (!isRecord(data)) return;

  if (data.action === "started" && client) {
    node.clients++;
    node.broadcastChannel.postMessage({
      action: "transferEntity",
      entity: client.hero,
    });
    client.node = node.broadcastChannel;
  }

  client?.port.postMessage(data);
};

export const newClient = (
  port: Port,
  startNode: (x: number, y: number) => void,
) => {
  const hero = newHero();

  const client: Client = {
    port,
    hero,
    close: () => {
      client.port.postMessage({ action: "close" });
      client.port.close();
      client.node?.postMessage({ action: "close", client: hero.entityId });
      delete clients[hero.entityId];
    },
  };

  // client.port.postMessage(scrub(hero, true));
  clients[hero.entityId] = client;

  console.log("client", hero.entityId, "connected");

  client.port.addEventListener(
    "message",
    (ev) => {
      const event = ev as MessageEvent;
      const data = event.data as unknown;

      if (!isAction(data)) return;

      console.log("recieved", data);

      data.client = client.hero.entityId;

      client.node?.postMessage(data);

      // setHero(hero);
      // actions[event.data.action as keyof typeof actions]?.(event.data);
    },
  );

  const { x, y } = getCell(hero);

  const node = nodes[`${x}, ${y}`];
  if (node) {
    node.clients++;
    node.broadcastChannel.postMessage({
      action: "transferEntity",
      entity: client.hero,
    });
    client.node = node.broadcastChannel;
  } else {
    const broadcastChannel = new BroadcastChannel(`Semcraft (${x}, ${y})`);

    nodes[`${x}, ${y}`] = { broadcastChannel, clients: 0 };

    let init = false;
    broadcastChannel.addEventListener("message", (ev) => {
      handleMessage(ev.data, nodes[`${x}, ${y}`], init ? undefined : client);
      init = true;
    });

    startNode(x, y);
  }

  client.port.postMessage({ action: "setHero", entity: scrub(hero, true) });
};

console.log("initialized");

/**

1) Client connects to Server
2) Client either requests a newHero or loadHero
3) Server determines Node of Hero
4) Server opens channel with Node, determines if it's up
  a) Determined via joining the Node's general BroadcastChannel and pinging
  b) If not up, the Node needs to be brought up. For `remote`, this is done directly. For `local`, this is done through the end client.
  c) Once the Node is up, a unique BroadcastChannel is setup for Server <-> Node communication.


1) All entities, including Heroes, have a single primary Node. A Hero Entity is mirrored on neighboring Nodes, but not added to the App.
2) A Node does not require all neighbor Nodes to be up. However, if a Hero is to be handed over, the Node should be brought up.
3) Non-Hero entities are


Server connects to Node

*/
