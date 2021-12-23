import { Controls, newControls, setTransmit } from "./controls.ts";
import { keyboard } from "./keyboard.ts";
import { mouse } from "./systems/mouse.ts";
import { moveAlongClient, moveToClient } from "./systems/movement.ts";
import { three } from "./systems/three.ts";
import { setHero } from "../hero.ts";
import { newSemcraft, Semcraft } from "../semcraft.ts";
import { withSemcraft, wrapSemcraft } from "../semcraftContext.ts";

export const newClient = (
  canvas: HTMLCanvasElement,
  controls: Controls,
): [Semcraft, () => void] => {
  const semcraft = newSemcraft();

  // Setup local server
  const server = new SharedWorker("./js/server/index.js", { type: "module" });
  server.port.start();
  server.port.addEventListener(
    "message",
    wrapSemcraft(semcraft, (ev) => {
      if (Array.isArray(ev.data)) semcraft.patch(ev.data);
      else {
        setHero(ev.data);
        semcraft.patch([ev.data]);
      }
    }),
  );
  withSemcraft(
    semcraft,
    () => {
      setTransmit((data) => {
        console.log("sending", data);
        server.port.postMessage(data);
      });
      semcraft.addSystem(moveToClient());
      semcraft.addSystem(moveAlongClient());
      semcraft.addSystem(mouse());
      semcraft.addSystem(three(canvas));
      keyboard();
      semcraft.addSystem(newControls(controls));
    },
  );

  // Start render loop
  let request = -1;
  const cb = () => {
    request = requestAnimationFrame(cb);
    if (semcraft) withSemcraft(semcraft, () => semcraft.update(() => {}));
  };
  cb();

  // Cleanup code
  return [semcraft, () => {
    server.port.postMessage({ action: "exit" });
    server.port.close();
    cancelAnimationFrame(request);
  }];
};
