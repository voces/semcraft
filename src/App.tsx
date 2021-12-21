import { Fragment, h } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { setHero } from "./hero.ts";
import { newSemcraft, Semcraft } from "./semcraft.ts";
import { withSemcraft, wrapSemcraft } from "./semcraftContext.ts";
import { setTransmit } from "./systems/controls.ts";

export const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [semcraft, setSemcraft] = useState<Semcraft>();

  // Start render loop
  useEffect(() => {
    let request = -1;
    const cb = () => {
      request = requestAnimationFrame(cb);
      if (semcraft) withSemcraft(semcraft, semcraft.render);
    };
    cb();

    return () => cancelAnimationFrame(request);
  }, [semcraft]);

  // Create the semcraft when we have a canvas
  useEffect(() => {
    if (!canvasRef.current || semcraft) return;

    const semcraft2 = newSemcraft(canvasRef.current);
    setSemcraft(semcraft2);

    const server = new SharedWorker("./js/server.js");
    server.port.start();
    server.port.addEventListener(
      "message",
      wrapSemcraft(semcraft2, (ev) => {
        if (Array.isArray(ev.data)) semcraft2.patch(ev.data);
        else {
          setHero(ev.data);
          semcraft2.patch([ev.data]);
        }
      }),
    );

    withSemcraft(
      semcraft2,
      () =>
        setTransmit((data) => {
          console.log("sending", data);
          server.port.postMessage(data);
        }),
    );

    // Skip closing the port for now; this effect is called when we call
    // setSemcraft
    // return () => server.port.close()
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
