import { Fragment, h, render } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { controls, setTransmit } from "./controls.ts";
import { keyboard } from "./keyboard.ts";
import { mouse } from "./systems/mouse.ts";
import { moveAlongClient, moveToClient } from "./systems/movement.ts";
import { three } from "./systems/three.ts";
import { setHero } from "../hero.ts";
import { newSemcraft } from "../semcraft.ts";
import { withSemcraft, wrapSemcraft } from "../semcraftContext.ts";

const newClient = (canvas: HTMLCanvasElement) => {
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
      controls();
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
  return () => {
    server.port.close();
    cancelAnimationFrame(request);
  };
};

export const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    return newClient(canvasRef.current);
  }, [canvasRef.current]);

  return (
    <>
      <canvas
        id="semcraft-canvas"
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        }}
      >
      </canvas>
    </>
  );
};

render(<App />, document.body);

globalThis.addEventListener("contextmenu", (e) => e.preventDefault());
