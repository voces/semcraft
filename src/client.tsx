import { Fragment, h, render } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { setHero } from "./hero.ts";
import { newSemcraft } from "./semcraft.ts";
import { withSemcraft, wrapSemcraft } from "./semcraftContext.ts";
import { setTransmit } from "./systems/controls.ts";

export const newClient = (canvas: HTMLCanvasElement) => {
  const semcraft = newSemcraft(canvas);

  // Setup local server
  const server = new SharedWorker("./js/localserver.js");
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
    () =>
      setTransmit((data) => {
        console.log("sending", data);
        server.port.postMessage(data);
      }),
  );

  // Start render loop
  let request = -1;
  const cb = () => {
    request = requestAnimationFrame(cb);
    if (semcraft) withSemcraft(semcraft, semcraft.render);
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
