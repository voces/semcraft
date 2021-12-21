import { tiles } from "./tiles.ts";
import { controls } from "./controls.ts";
import { currentSemcraft } from "../semcraftContext.ts";
import { mouse } from "./mouse.ts";
import { keyboard } from "./keyboard.ts";
import { movement, movement2 } from "./movement.ts";
import { timers } from "./timers.ts";
import { grid } from "./grid.ts";

export const logic = () => {
  const semcraft = currentSemcraft();

  // Systems on clients
  if ("document" in globalThis) {
    semcraft.addSystem(mouse());
    keyboard();
    controls();
  } else {
    // Systems on servers
    semcraft.addSystem(grid());

    // Other logic on servers
    tiles();
    semcraft.add({ x: 5, y: 0 });
    semcraft.add({ x: 0, y: 5 });
    semcraft.add({ x: -5, y: 0 });
    semcraft.add({ x: 0, y: -5 });
  }

  // Systems on both
  semcraft.addSystem(movement());
  semcraft.addSystem(movement2());
  semcraft.addSystem(timers());
};
