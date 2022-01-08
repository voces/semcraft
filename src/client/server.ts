import { setHero } from "../hero.ts";
import { currentSemcraft, wrapSemcraft } from "../semcraftContext.ts";

export const newServer = (type: "local" | "remote") => {
  const semcraft = currentSemcraft();

  if (type === "local") {
    const server = new SharedWorker(`./js/server/localBridge.js`, {
      name: `Semcraft`,
      type: "module",
    });
    server.port.start();
    server.port.addEventListener(
      "message",
      wrapSemcraft(semcraft, (ev) => {
        if (Array.isArray(ev.data)) {
          semcraft.patch(ev.data);
          return;
        }

        console.log({ ...ev.data });

        if (ev.data.action === "startNode") {
          const worker = new SharedWorker("./js/server/localNode.js", {
            name: `Semcraft (${ev.data.x}, ${ev.data.y})`,
            type: "module",
          });
          worker.port.postMessage(ev.data);
          return;
        }

        if (ev.data.action === "setHero") {
          semcraft.add(ev.data.entity);
          setHero(ev.data.entity);
        }
      }),
    );

    return server.port;
  }

  // Remote; we'll be using websockets
  return {
    postMessage: () => console.error("Not yet implemented"),
    close: () => console.error("Not yet implemented"),
  };
};
