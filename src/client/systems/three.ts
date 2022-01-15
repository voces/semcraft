import {
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { System } from "../../core/System.ts";
import { currentHero } from "../../hero.ts";
import { data } from "../../util/data.ts";

const { current: currentThree, set } = data<{
  camera: PerspectiveCamera;
  scene: Scene;
}>();

export { currentThree };

const initializeScene = (canvas: HTMLCanvasElement) => {
  const scene = new Scene();
  const camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.z = 10;

  const renderer = new WebGLRenderer({ canvas });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const light = new HemisphereLight(0xffffbb, 0x080820, 1);
  scene.add(light);
  light.position.set(0, 0, 1);

  globalThis.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });

  return [scene, camera, renderer] as const;
};

export const three = (canvas: HTMLCanvasElement) => {
  const [scene, camera, renderer] = initializeScene(canvas);

  set({ scene, camera });

  return {
    props: ["x", "y", "mesh"],
    update: () => {
      renderer.render(scene, camera);
    },
    onAdd: (entity) => {
      entity.mesh.position.x = entity.x;
      entity.mesh.position.y = entity.y;

      scene.add(entity.mesh);
    },
    onChange: (entity) => {
      entity.mesh.position.x = entity.x;
      entity.mesh.position.y = entity.y;

      try {
        const hero = currentHero();
        if (hero === entity) {
          camera.position.x = entity.x;
          camera.position.y = entity.y;
        }
      } catch { /*do nothing*/ }
    },
    onRemove: (entity) => {
      // TODO: store the mesh in in a weakmap to ensure removal if someone sets
      // it to undefined
      if (entity.mesh) scene.remove(entity.mesh);
    },
  } as System<"x" | "y" | "mesh">;
};
