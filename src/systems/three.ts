import {
  BoxGeometry,
  Camera,
  HemisphereLight,
  Mesh,
  MeshPhongMaterial,
  PerspectiveCamera,
  Raycaster,
  Scene,
  WebGLRenderer,
} from "three";
import { Entity } from "../proxyecs.ts";

const raycast = (
  raycaster: Raycaster,
  screenCursor: { x: number; y: number },
  groundCursor: { x: number; y: number },
  camera: Camera,
  scene: Scene,
) => {
  raycaster.setFromCamera(screenCursor, camera);

  const intersections = raycaster.intersectObjects(
    scene.children,
    true,
  );

  outer:
  for (let i = intersections.length - 1; i >= 0; i--) {
    if ("isTerrain" in intersections[i].object) {
      groundCursor.x = intersections[i].point.x;
      groundCursor.y = intersections[i].point.y;
      break outer;
    }
  }

  let foundEntity = false;

  for (let i = 0; i < this.intersections.length; i++) {
    const object: EntityObject = this.intersections[i].object;
    const entity = object?.entity;
    if (entity && isSelectableEntity(entity) && entity.selectable) {
      foundEntity = true;
      if (this.entity !== entity) {
        if (this.entity) Hover.clear(this.entity);
        this.entity = entity;
        new Hover(entity);
      }
      break;
    }
  }

  if (!foundEntity && this.entity) {
    Hover.clear(this.entity);
    this.entity = undefined;
  }
};

export const three = (canvas: HTMLCanvasElement) => {
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

  const groundCursor = { x: 0, y: 0 };
  const screenCursor = { x: 0, y: 0 };
  // const
  let mouseMoved = false;
  globalThis.addEventListener("mousemove", (e) => {
    mouseMoved = true;
  });
  // currentSemcraft().add(groundCursor);

  return ({
    props: ["x", "y"] as const,
    render: () => {
      renderer.render(scene, camera);
      if (!mouseMoved) return;
    },
    test: (entity: Entity) =>
      typeof entity.x === "number" && typeof entity.y === "number" &&
      entity.mesh !== null,
    onAdd: (entity: Entity) => {
      const mesh = entity.mesh ?? (entity.mesh = new Mesh(
        new BoxGeometry(1),
        new MeshPhongMaterial({ color: 0xffffff }),
      ));
      mesh.position.x = entity.x!;
      mesh.position.y = entity.y!;
      scene.add(mesh);
    },
    onChange: (entity: Entity) => {
      const mesh = entity.mesh;
      if (!mesh) return;
      mesh.position.x = entity.x!;
      mesh.position.y = entity.y!;
    },
  });
};
