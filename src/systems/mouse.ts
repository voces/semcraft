import { Raycaster } from "three";
import { Entity } from "../core/Entity.ts";
import { currentSemcraft, wrapSemcraft } from "../semcraftContext.ts";
import { data } from "../util/data.ts";
import { currentThree } from "./three.ts";

export type Mouse = {
  ground: { x: number; y: number };
  screen: { x: number; y: number };
  hover: Entity | undefined;
  buttons: {
    Left: boolean;
    Middle: boolean;
    Right: boolean;
  };
};

const { current: currentMouse, set } = data<Mouse>();
export { currentMouse };

const raycaster = new Raycaster();
const raycast = (mouse: Mouse) => {
  const { camera, scene } = currentThree();

  raycaster.setFromCamera(mouse.screen, camera);

  const intersections = raycaster.intersectObjects(
    scene.children,
    true,
  );

  outer:
  for (let i = intersections.length - 1; i >= 0; i--) {
    const object = intersections[i].object;
    if (object.userData.isTerrain) {
      mouse.ground.x = intersections[i].point.x;
      mouse.ground.y = intersections[i].point.y;
      break outer;
    }
  }

  for (let i = 0; i < intersections.length; i++) {
    const object = intersections[i].object;
    const entity = object?.userData;
    if (entity && !entity.isTerrain) {
      mouse.hover = entity as Entity;
      return;
    }
  }

  mouse.hover = undefined;
};

export const mouse = () => {
  const semcraft = currentSemcraft();

  const mouse = {
    ground: { x: 0, y: 0 },
    screen: { x: 0, y: 0 },
    hover: undefined,
    buttons: { Left: false, Middle: false, Right: false },
  };
  set(mouse);

  let mouseMoved = false;
  globalThis.addEventListener("mousemove", (e) => {
    mouseMoved = true;
    mouse.screen.x = (e.x / window.innerWidth) * 2 - 1;
    mouse.screen.y = -(e.y / window.innerHeight) * 2 + 1;
  });

  globalThis.addEventListener(
    "mousedown",
    wrapSemcraft(semcraft, (e) => {
      if (e.button === 0) mouse.buttons.Left = true;
      else if (e.button === 1) mouse.buttons.Middle = true;
      else if (e.button === 2) mouse.buttons.Right = true;

      mouse.screen.x = (e.x / window.innerWidth) * 2 - 1;
      mouse.screen.y = -(e.y / window.innerHeight) * 2 + 1;
      raycast(mouse);
      semcraft.dispatchEvent("mousedown", mouse);
    }),
  );

  globalThis.addEventListener(
    "mouseup",
    wrapSemcraft(semcraft, (e) => {
      if (e.button === 0) mouse.buttons.Left = false;
      else if (e.button === 1) mouse.buttons.Middle = false;
      else if (e.button === 2) mouse.buttons.Right = false;

      mouse.screen.x = (e.x / window.innerWidth) * 2 - 1;
      mouse.screen.y = -(e.y / window.innerHeight) * 2 + 1;
      raycast(mouse);
      semcraft.dispatchEvent("mouseup", mouse);
    }),
  );

  return {
    render: () => {
      // TODO: replace mouse.buttons.Left with the action hotkey move uses
      if (mouseMoved || mouse.buttons.Left) {
        raycast(mouse);
        semcraft.dispatchEvent("mousemove", mouse);
        mouseMoved = false;
      }
    },
  };
};
