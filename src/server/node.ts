import { WriteLogEntry } from "../core/App.ts";
import { Entity, Widget } from "../core/Entity.ts";
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
import { Client } from "./contexts/client.ts";
import { newPoisonSystem } from "./systems/poison.ts";
import { newAISystem } from "./systems/ai.ts";
import { newAttackSystem } from "./systems/attack.ts";
import { newLockoutSystem } from "./systems/lockouts.ts";
import { newDeathSystem } from "./systems/death.ts";
import { System } from "../core/System.ts";
import { setHero } from "../hero.ts";
import { scrub } from "./util.ts";

export const AREA_OF_KNOWLEDGE = 20;

export const newNode = (x: number, y: number) => {
  const semcraft = newSemcraft();
  const clients = new Map<Entity["entityId"], Client>();

  const channel = new BroadcastChannel(`Semcraft (${x}, ${y})`);
  channel.addEventListener(
    "message",
    wrapSemcraft(semcraft, (ev) => {
      const data = ev.data;
      console.log("received", data);
      const client = clients.get(data.client);
      if (client) setHero(client.hero);
      actions[data.action as keyof typeof actions]?.(data);
    }),
  );
  channel.postMessage({ action: "started" });

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
          for (const client of clients.values()) {
            try {
              if (!client.hero) continue;

              const writes: WriteLogEntry[] = [];

              // Send newly known entities in full
              const nearEntities = new Set(grid.queryPoint(
                client.hero.x,
                client.hero.y,
                AREA_OF_KNOWLEDGE,
                true,
              ));
              const newEntities = new Set<Widget>();
              const newEntityIds = new Set<string>();
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
                  client.hero.x,
                  client.hero.y,
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
                    x: entity.x,
                    y: entity.y,
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

              // TODO: Setup a channel for each bridge, and group messages by bridge
              channel.postMessage(
                [
                  Object.fromEntries(writes.map((
                    w,
                  ) => [
                    w.entityId,
                    scrub(w, client.hero?.entityId === w.entityId),
                  ])),
                  { [client.hero.entityId]: writes.map((w) => w.entityId) },
                ],
              );
            } catch (err) {
              console.error(err);
              if (client.hero) semcraft.delete(client.hero);
              clients.delete(client.hero.entityId);
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
    semcraft.addSystem(newGrid(0, 0));
    semcraft.addSystem(timers());
    semcraft.addSystem(collision());
    semcraft.addSystem(newManaRegenSystem());
    semcraft.addSystem(newLifeRegenSystem());
    semcraft.addSystem(newPoisonSystem());
    semcraft.addSystem(newAISystem());
    semcraft.addSystem(newAttackSystem());
    semcraft.addSystem(newLockoutSystem());
    semcraft.addSystem(newDeathSystem());
    semcraft.addSystem({
      props: [
        "isHero",
        "x",
        "y",
        "life",
        "affinities",
        "counts",
        "mana",
        "maxLife",
      ],
      onAdd: (hero) =>
        clients.set(hero.entityId, { hero, knownEntities: new Set() }),
      onRemove: (hero) => clients.delete(hero.entityId),
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
        owner: "neutral-aggressive",
        attack: {
          range: 1,
          damage: 5,
          cooldown: 1,
        },
        ai: {
          check: (e) => {
            // Idle check
            if (e.moveTo || e.attackTarget) return "none";

            // Attack
            near = Array.from(grid.queryPoint(e.x!, e.y!, 5)).filter((v) =>
              !v.isTerrain && v.owner !== e.owner
            );
            if (near.length) {
              e.attackTarget = near[0];
              return "none";
            }

            if (Math.random() < 0.99) return "none";

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

  console.log("newNode", x, y);
};
