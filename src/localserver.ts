import { actions } from "./actions/index.ts";
import { WriteLogEntry } from "./core/App.ts";
import { Entity } from "./core/Entity.ts";
import { setHero } from "./hero.ts";
import { newSemcraft } from "./semcraft.ts";
import { withSemcraft, wrapSemcraft } from "./semcraftContext.ts";
import { currentGrid } from "./systems/grid.ts";
import { Grid } from "./util/Grid.ts";

const semcraft = newSemcraft();

const AREA_OF_KNOWLEDGE = 20;

type Client = {
  port: MessagePort;
  hero: Entity;
  knownEntities: Set<Entity & { x: number; y: number }>;
};

const clients = new Set<Client>();

const publicAttributes = ["entityId", "x", "y", "art", "isTerrain", "deleted"];

const scrub = (write: WriteLogEntry | Entity) =>
  Object.fromEntries(
    Object.entries(write).filter(([k]) => publicAttributes.includes(k)),
  );

// Start update loop
setInterval(
  wrapSemcraft(semcraft, () => {
    semcraft.update((writeLog) => {
      if (writeLog.size) {
        console.log(
          "found",
          writeLog.size,
          "updates for",
          clients.size,
          "clients",
        );
        for (const client of clients) {
          try {
            const writes: WriteLogEntry[] = [];

            // Send newly known entities in full
            const nearEntities = new Set(grid.queryPoint(
              client.hero.x!,
              client.hero.y!,
              AREA_OF_KNOWLEDGE,
            ));
            const newEntities = new Set<Entity & { x: number; y: number }>();
            for (const entity of nearEntities) {
              if (
                !client.knownEntities.has(entity)
              ) {
                newEntities.add(entity);
                writes.push(entity);
              }
            }

            // Send updated entities in patches
            writes.push(
              ...writeLog.queryPoint(
                client.hero.x!,
                client.hero.y!,
                AREA_OF_KNOWLEDGE,
              ),
            );

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

            console.log(
              "sending",
              writes.length,
              "updates to client",
            );
            client.port.postMessage(
              writes.map(scrub),
            );
          } catch (err) {
            console.log(err);
            semcraft.clear(client.hero);
            clients.delete(client);
          }
        }
      }
    });
  }),
  16,
);

let grid: Grid<Entity & { x: number; y: number }>;

// Initialize the world
withSemcraft(semcraft, () => {
  grid = currentGrid();
});

globalThis.addEventListener(
  "connect",
  wrapSemcraft(semcraft, (e) => {
    const event = e as MessageEvent;

    const hero = semcraft.add({
      x: (Math.random() - 0.5) * 10,
      y: (Math.random() - 0.5) * 10,
      speed: 10,
      art: { geometry: { type: "sphere" as const } },
    });

    const client: Client = {
      port: event.ports[0],
      hero,
      knownEntities: new Set(),
    };

    client.port.postMessage(scrub(hero));

    clients.add(client);

    console.log("client connected");

    client.port.start();
    client.port.addEventListener(
      "message",
      wrapSemcraft(semcraft, (ev) => {
        setHero(hero);
        console.log(ev.data);
        actions[ev.data.action as keyof typeof actions]?.serverHandler(ev.data);
      }),
    );
  }),
);

console.log("init");
