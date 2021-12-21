import {
  BoxGeometry,
  BufferGeometry,
  HemisphereLight,
  Material,
  Mesh,
  MeshPhongMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  SphereGeometry,
  WebGLRenderer,
} from "three";
import { Entity } from "../core/Entity.ts";
import { System } from "../core/System.ts";
import { currentHero } from "../hero.ts";
import { data } from "../util/data.ts";
import { materialsBitmap } from "./tiles.ts";

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

const defaultBox = new BoxGeometry();
const defaultShpere = new SphereGeometry(1 / 2);
const defaultPlane = new PlaneGeometry();

// Do this via memoization instead...
const initializeGeometry = (
  def: Required<Entity>["art"]["geometry"],
): BufferGeometry => {
  if (!def) return defaultBox;

  switch (def.type) {
    case "plane": {
      return defaultPlane;
    }
    case "sphere": {
      if (def.radius) return new SphereGeometry(def.radius);
      return defaultShpere;
    }
  }
};

const defaultMaterial = new MeshPhongMaterial({ color: 0xffffff });

const initializeMaterial = (
  def: Required<Entity>["art"]["material"],
): Material => {
  if (!def) return defaultMaterial;

  switch (def.type) {
    case "tile":
      return materialsBitmap[def.index];
    case "phong":
      return new MeshPhongMaterial({ color: def.color });
  }
};

const initializeMesh = (entity: Entity) => {
  const geometry = initializeGeometry(entity.art?.geometry);
  const material = initializeMaterial(entity.art?.material);

  const mesh = new Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
};

export const three = (canvas: HTMLCanvasElement) => {
  const [scene, camera, renderer] = initializeScene(canvas);

  set({ scene, camera });

  return {
    props: ["x", "y"],
    render: () => {
      renderer.render(scene, camera);
      try {
        const hero = currentHero();
        if (hero.mesh) {
          camera.position.x = hero.mesh.position.x;
          camera.position.y = hero.mesh.position.y;
        }
      } catch { /* do nothing */ }
    },
    onAdd: (entity) => {
      if (!entity.mesh) entity.mesh = initializeMesh(entity);
      Object.defineProperty(entity.mesh, "userData", { value: entity });

      entity.mesh!.position.x = entity.x!;
      entity.mesh!.position.y = entity.y!;

      scene.add(entity.mesh!);
    },
    onChange: (entity) => {
      const mesh = entity.mesh;
      if (!mesh) return;
      mesh.position.x = entity.x;
      mesh.position.y = entity.y;

      try {
        const hero = currentHero();
        if (hero === entity) {
          camera.position.x = entity.x;
          camera.position.y = entity.y;
        }
      } catch { /*do nothing*/ }
    },
    onRemove: (entity) => {
      scene.remove(entity.mesh!);
    },
  } as System<"x" | "y">;
};

export const threeServer = () => ({
  props: ["x", "y"],
  onAdd: (entity) => {
    // deno-lint-ignore no-explicit-any
    entity.mesh = true as any;
  },
} as System<"x" | "y">);
