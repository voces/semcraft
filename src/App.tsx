import { Fragment, h } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { Semcraft } from "./Semcraft.ts";

export const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Semcraft>();

  // Start update loop
  useEffect(() => {
    const interval = setInterval(() => game?.update(), 50);
    return () => clearInterval(interval);
  });

  // Start render loop
  useEffect(() => {
    let request = -1;
    const cb = () => {
      request = requestAnimationFrame(cb);
      game?.render();
    };
    cb();

    return () => cancelAnimationFrame(request);
  });

  // Create the game when we have a canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    setGame(new Semcraft(canvasRef.current));
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
