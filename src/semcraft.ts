import { Keyboard } from "./client/keyboard.ts";
import type { Mouse } from "./client/systems/mouse.ts";
import { App, newApp } from "./core/App.ts";
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

export const newSemcraft = () => {
  const app = emitter<App, EventMap>(newApp({}));

  globalThis.game = app;

  return app;
};

export type Semcraft = ReturnType<typeof newSemcraft>;
