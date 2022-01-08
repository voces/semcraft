import { Controls, newControls, setTransmit } from "./controls.ts";
import { keyboard } from "./keyboard.ts";
import { mouse } from "./systems/mouse.ts";
import { moveAlongClient, moveToClient } from "./systems/movement.ts";
import { three } from "./systems/three.ts";
import { newSemcraft, Semcraft } from "../semcraft.ts";
import { withSemcraft } from "../semcraftContext.ts";
import { newMeshFromArtSystem } from "./systems/meshFromArt.ts";
import { newServer } from "./server.ts";

export const newClient = (
  canvas: HTMLCanvasElement,
  controls: Controls,
): [Semcraft, () => void] => {
  const semcraft = newSemcraft();

  let server: ReturnType<typeof newServer>;

  // Setup local server
  withSemcraft(
    semcraft,
    () => {
      const server = newServer("local");
      setTransmit((data) => server.postMessage(data));
      semcraft.addSystem(moveToClient());
      semcraft.addSystem(moveAlongClient());
      semcraft.addSystem(mouse());
      semcraft.addSystem(newMeshFromArtSystem());
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
    server.postMessage({ action: "exit" });
    server.close();
    cancelAnimationFrame(request);
  }];
};
