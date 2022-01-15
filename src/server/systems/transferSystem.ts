import { AREA_OF_KNOWLEDGE, SIZE } from "../../constants.ts";
import { System } from "../../core/System.ts";
import { setHero } from "../../hero.ts";
import { currentSemcraft, wrapSemcraft } from "../../semcraftContext.ts";
import { actions } from "../actions/index.ts";
import { Client } from "../contexts/client.ts";
import { getChannel, getClients } from "../node.ts";

const newNeighbor = (
  x: number,
  y: number,
  xOffset: number,
  yOffset: number,
) => {
  const semcraft = currentSemcraft();

  const key = (xOffset < 0 || yOffset < 0)
    ? `(${x + xOffset}, ${y + yOffset}) <-> (${x}, ${y})`
    : `(${x}, ${y}) <-> (${x + xOffset}, ${y + yOffset})`;

  const channel = new BroadcastChannel(`Semcraft ${key}`);
  channel.postMessage({ action: "started" });

  const neighbor = {
    x: x + xOffset,
    y: y + yOffset,
    channel,
    status: "init",
    queue: [] as unknown[],
    stagedClients: new WeakSet<Client>(),
  };

  channel.addEventListener(
    "message",
    wrapSemcraft(semcraft, (ev) => {
      if (neighbor.status !== "ready") {
        neighbor.status = "ready";
        for (const msg of neighbor.queue) {
          channel.postMessage(msg);
        }

        neighbor.queue.splice(0, Infinity);
      }

      const data = ev.data;
      console.log(`received ${key}`, data);
      const client = getClients().get(data.client);
      if (client) setHero(client.hero);
      actions[data.action as keyof typeof actions]?.(data);
    }),
  );

  return neighbor;
};

const stageClient = (
  neighbor: ReturnType<typeof newNeighbor>,
  client: Client,
) => {
  // Inform bridge to monitor the new node's broadcast
  if (!neighbor.stagedClients.has(client)) {
    neighbor.stagedClients.add(client);
    getChannel().postMessage({
      client: client.hero.entityId,
      action: "stage",
      x: neighbor.x,
      y: neighbor.y,
    });
  }

  const message = {
    action: "stageEntity",
    entity: client.hero,
  };

  if (neighbor.status === "ready") {
    neighbor.channel.postMessage(message);
    return;
  }

  if (neighbor.status === "init") {
    neighbor.status = "starting";
    getChannel().postMessage({
      client: client.hero.entityId,
      action: "startNode",
      x: neighbor.x,
      y: neighbor.y,
    });

    // TODO: we should REPLACE previous
    neighbor.queue.push(message);
  }
};

export const newTransferSystem = (
  x: number,
  y: number,
) => {
  const clients = getClients();
  const semcraft = currentSemcraft();

  const leftBoundary = (x - 0.5) * SIZE;
  const rightBoundary = (x + 0.5) * SIZE;
  const topBoundary = (y + 0.5) * SIZE;
  const botBoundary = (y - 0.5) * SIZE;
  const leftBoundaryApproach = (x - 0.5) * SIZE + AREA_OF_KNOWLEDGE;
  const rightBoundaryApproach = (x + 0.5) * SIZE - AREA_OF_KNOWLEDGE;
  const topBoundaryApproach = (y + 0.5) * SIZE - AREA_OF_KNOWLEDGE;
  const botBoundaryApproach = (y - 0.5) * SIZE + AREA_OF_KNOWLEDGE;

  const topLeftNeighbor = newNeighbor(x, y, -1, 1);
  const topNeighbor = newNeighbor(x, y, 0, 1);
  const topRightNeighbor = newNeighbor(x, y, 1, 1);
  const leftNeighbor = newNeighbor(x, y, -1, 0);
  const rightNeighbor = newNeighbor(x, y, 1, 0);
  const botLeftNeighbor = newNeighbor(x, y, -1, -1);
  const botNeighbor = newNeighbor(x, y, 0, -1);
  const botRightNeighbor = newNeighbor(x, y, 1, -1);

  return ({
    props: ["isHero", "x", "y"],
    onAdd: (hero) => {
      if (clients.has(hero.entityId)) return;

      clients.set(hero.entityId, {
        hero,
        knownEntities: new Set(),
      });
    },
    // onRemove: (hero) => {
    //   clients.delete(hero.entityId);
    //   console.log("removing client");
    // },

    // TODO: Do this in update instead of onChange...
    onChange: (hero) => {
      const client = clients.get(hero.entityId);
      if (!client) return;

      const transfer = (neighbor: ReturnType<typeof newNeighbor>) => {
        // Just assuming this is up...
        neighbor.channel.postMessage({
          action: "transferEntity",
          entity: hero,
        });

        semcraft.delete(hero);
      };

      // Transferring
      if (hero.x < leftBoundary) {
        if (hero.y < botBoundary) return transfer(botLeftNeighbor);
        if (hero.y > topBoundary) return transfer(topLeftNeighbor);
        return transfer(leftNeighbor);
      }
      if (hero.x > rightBoundary) {
        if (hero.y < botBoundary) return transfer(botRightNeighbor);
        if (hero.y > topBoundary) return transfer(topRightNeighbor);
        return transfer(rightNeighbor);
      }
      if (hero.y < botBoundary) return transfer(botNeighbor);
      if (hero.y > topBoundary) return transfer(topNeighbor);

      // Staging
      if (hero.x < leftBoundaryApproach) {
        stageClient(leftNeighbor, client);
        if (hero.y < botBoundaryApproach) {
          stageClient(botLeftNeighbor, client);
        } else if (hero.y > topBoundaryApproach) {
          stageClient(topLeftNeighbor, client);
        }
      } else if (hero.x > rightBoundaryApproach) {
        stageClient(rightNeighbor, client);
        if (hero.y < botBoundaryApproach) {
          stageClient(botRightNeighbor, client);
        } else if (hero.y > topBoundaryApproach) {
          stageClient(topRightNeighbor, client);
        }
      } else if (hero.y < botBoundaryApproach) {
        stageClient(botNeighbor, client);
      } else if (hero.y > topBoundaryApproach) {
        stageClient(topNeighbor, client);
      }
    },
  } as System<
    | "isHero"
    | "x"
    | "y"
    | "life"
    | "affinities"
    | "counts"
    | "mana"
    | "maxLife"
  >);
};
