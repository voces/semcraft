import { WriteLogEntry } from "../core/App.ts";
import { Entity, Widget } from "../core/Entity.ts";
import { newHero, setHero } from "../hero.ts";
import { newSemcraft } from "../semcraft.ts";
import { withSemcraft, wrapSemcraft } from "../semcraftContext.ts";
import { actions } from "./actions/index.ts";
import { currentGrid, newGrid } from "./systems/grid.ts";
import { moveAlongServer, moveToServer } from "./systems/movement.ts";
import { timers } from "./systems/timers.ts";
import { tiles } from "./tiles.ts";
import { Grid } from "../util/Grid.ts";
import { collision } from "./systems/collision.ts";
import { SIZE } from "../constants.ts";
import { newLifeRegenSystem, newManaRegenSystem } from "./systems/regen.ts";

const semcraft = newSemcraft();

const AREA_OF_KNOWLEDGE = 20;

type Client = {
  port: MessagePort;
  hero: Entity;
  knownEntities: Set<Widget>;
};

const clients = new Set<Client>();

const publicAttributes = [
  "art",
  "deleted",
  "entityId",
  "isTerrain",
  "moveAlong",
  "moveTo",
  "name",
  "speed",
  "x",
  "y",
];
const ownerAttributes = [
  "life",
  "mana",
];

const scrub = (write: WriteLogEntry | Entity, owned: boolean) =>
  Object.fromEntries(
    Object.entries(write).filter(([k]) =>
      publicAttributes.includes(k) || (owned && ownerAttributes.includes(k))
    ),
  );

// Start update loop
setInterval(
  wrapSemcraft(semcraft, () => {
    semcraft.update((writeLog) => {
      if (writeLog.size) {
        // console.log(
        //   "found",
        //   writeLog.size,
        //   "updates for",
        //   clients.size,
        //   "clients",
        // );
        for (const client of clients) {
          try {
            const writes: WriteLogEntry[] = [];

            // Send newly known entities in full
            const nearEntities = new Set(grid.queryPoint(
              client.hero.x!,
              client.hero.y!,
              AREA_OF_KNOWLEDGE,
              true,
            ));
            const newEntities = new Set<Widget>();
            const newEntityIds = new Set<number>();
            for (const entity of nearEntities) {
              if (
                !client.knownEntities.has(entity)
              ) {
                newEntities.add(entity);
                newEntityIds.add(entity.entityId);
                writes.push(entity);
              }
            }

            // Send updated entities in patches
            for (
              const write of writeLog.queryPoint(
                client.hero.x!,
                client.hero.y!,
                AREA_OF_KNOWLEDGE,
                true,
              )
            ) {
              if (!newEntityIds.has(write.entityId)) writes.push(write);
            }

            // Delete entities that are no longer in view
            for (const entity of client.knownEntities) {
              if (!nearEntities.has(entity)) {
                writes.push({
                  entityId: entity.entityId,
                  x: entity.x!,
                  y: entity.y!,
                  deleted: true,
                });
              }
            }
            client.knownEntities = nearEntities;

            // console.log(
            //   "sending",
            //   writes.length,
            //   "updates to client",
            // );
            client.port.postMessage(
              writes.map((w) => scrub(w, client.hero.entityId === w.entityId)),
            );
          } catch (err) {
            console.error(err);
            semcraft.delete(client.hero);
            clients.delete(client);
          }
        }
      }
    });
  }),
  16,
);

let grid: Grid<Widget>;

// Initialize the world
withSemcraft(semcraft, () => {
  semcraft.addSystem(moveToServer());
  semcraft.addSystem(moveAlongServer());
  semcraft.addSystem(newGrid());
  semcraft.addSystem(timers());
  semcraft.addSystem(collision());
  semcraft.addSystem(newManaRegenSystem());
  semcraft.addSystem(newLifeRegenSystem());
  grid = currentGrid();

  tiles();

  const beforeDelete = () =>
    semcraft.add({
      x: (Math.random() - 0.5) * SIZE,
      y: (Math.random() - 0.5) * SIZE,
      life: 25,
      beforeDelete,
    });

  for (let i = 0; i < 100; i++) beforeDelete();
});

globalThis.addEventListener(
  "connect",
  wrapSemcraft(semcraft, (e) => {
    const event = e as MessageEvent;

    const hero = newHero();

    const client: Client = {
      port: event.ports[0],
      hero,
      knownEntities: new Set(),
    };

    client.port.postMessage(scrub(hero, true));

    clients.add(client);

    console.log("client", client.hero.entityId, "connected");

    client.port.start();
    client.port.addEventListener(
      "message",
      wrapSemcraft(semcraft, (ev) => {
        setHero(hero);
        console.log(ev.data);
        actions[ev.data.action as keyof typeof actions]?.(ev.data);
      }),
    );
  }),
);
