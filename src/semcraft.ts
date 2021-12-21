import { App, newApp } from "./core/App.ts";
import { withSemcraft } from "./semcraftContext.ts";
import { Keyboard } from "./systems/keyboard.ts";
import { logic } from "./systems/logic.ts";
import { Mouse } from "./systems/mouse.ts";
import { three, threeServer } from "./systems/three.ts";
import { emitter } from "./util/emitter.ts";

type EventMap = {
  mousemove: (mouse: Mouse) => void;
  mousedown: (mouse: Mouse) => void;
  mouseup: (mouse: Mouse) => void;
  keydown: (keyboard: Keyboard) => void;
  keyup: (keyboard: Keyboard) => void;
};

declare global {
  // deno-lint-ignore no-var
  var game: Semcraft;
}

export const newSemcraft = (canvas?: HTMLCanvasElement) => {
  const app = emitter<App, EventMap>(newApp({}));

  withSemcraft(app, () => {
    if (canvas) app.addSystem(three(canvas));
    else app.addSystem(threeServer());
    logic();
  });

  globalThis.game = app;

  return app;
};

export type Semcraft = ReturnType<typeof newSemcraft>;
