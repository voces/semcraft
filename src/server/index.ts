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
import { Client, setClient } from "./contexts/client.ts";
import { newPoisonSystem } from "./systems/poison.ts";
import { newAISystem } from "./systems/ai.ts";
import { newAttackSystem } from "./systems/attack.ts";
import { newLockoutSystem } from "./systems/lockouts.ts";
import { newDeathSystem } from "./systems/death.ts";

const semcraft = newSemcraft();

const AREA_OF_KNOWLEDGE = 20;

const clients = new Set<Client>();

const publicAttributes = [
  "art",
  "deleted",
  "entityId",
  "isTerrain",
  "moveAlong",
  "moveTo",
  "name",
  "owner",
  "speed",
  "x",
  "y",
];
const ownerAttributes = [
  "life",
  "mana",
  "maxLife",
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
                entity.active = (entity.active ?? 0) + 1;
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
                if (entity.active! <= 1) entity.active = undefined;
                else entity.active = (entity.active ?? 0) - 1;
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
  semcraft.addSystem(newPoisonSystem());
  semcraft.addSystem(newAISystem());
  semcraft.addSystem(newAttackSystem());
  semcraft.addSystem(newLockoutSystem());
  semcraft.addSystem(newDeathSystem());
  grid = currentGrid();

  tiles();

  const beforeDelete = () => {
    let near: Widget[];
    return semcraft.add({
      x: Math.round((Math.random() - 0.5) * SIZE * 100) / 100,
      y: Math.round((Math.random() - 0.5) * SIZE * 100) / 100,
      life: 25,
      beforeDelete,
      art: { geometry: { type: "cylinder" } },
      speed: 2,
      owner: -1,
      attack: {
        range: 1,
        damage: 5,
        cooldown: 1,
      },
      ai: {
        check: (e) => {
          // Idle check
          if (e.moveTo || e.attackTarget || Math.random() < 0.9) return "none";

          // Attack
          near = Array.from(grid.queryPoint(e.x!, e.y!, 5)).filter((v) =>
            !v.isTerrain && v.owner !== e.owner
          );
          if (near.length) {
            e.attackTarget = near[0];
            return "none";
          }

          // Randomly move
          e.moveTo = {
            x: e.x! + (Math.random() - 0.5) * 3,
            y: e.y! + (Math.random() - 0.5) * 3,
          };

          return "none";
        },
      },
    });
  };

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
      close: () => {
        // TODO: inform of closure
        client.port.close();
        semcraft.delete(hero);
        clients.delete(client);
      },
    };

    client.port.postMessage(scrub(hero, true));

    clients.add(client);

    console.log("client", client.hero.entityId, "connected");

    client.port.start();
    client.port.addEventListener(
      "message",
      wrapSemcraft(semcraft, (ev) => {
        setHero(hero);
        setClient(client);
        actions[ev.data.action as keyof typeof actions]?.(ev.data);
      }),
    );
  }),
);

console.log("initialized");
