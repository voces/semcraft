import {
  BoxGeometry,
  BufferGeometry,
  CylinderGeometry,
  Material,
  Mesh,
  MeshPhongMaterial,
  PlaneGeometry,
  SphereGeometry,
} from "three";
import { Entity } from "../../core/Entity.ts";
import { System } from "../../core/System.ts";
import { materialsBitmap } from "../tiles.ts";
import { memoize } from "../utils/memoize.ts";

// Do this via memoization instead...
const initializeGeometry = memoize((
  def: Required<Entity>["art"]["geometry"],
): BufferGeometry => {
  if (!def) return new BoxGeometry();

  switch (def.type) {
    case "plane": {
      return new PlaneGeometry();
    }
    case "sphere": {
      if (def.radius) return new SphereGeometry(def.radius);
      return new SphereGeometry(1 / 2);
    }
    case "cylinder": {
      const cylinder = new CylinderGeometry(1 / 2, 1 / 2, 1, 20, 1);
      cylinder.rotateX(Math.PI / 2);
      return cylinder;
    }
  }
});

const defaultMaterial = new MeshPhongMaterial({ color: 0xffffff });

const initializeMaterial = memoize((
  def: Required<Entity>["art"]["material"],
): Material => {
  if (!def) return defaultMaterial;

  switch (def.type) {
    case "tile":
      return materialsBitmap[def.index];
    case "phong":
      return new MeshPhongMaterial({ color: def.color });
  }
});

const initializeMesh = (entity: Entity) => {
  const geometry = initializeGeometry(entity.art?.geometry);
  const material = initializeMaterial(entity.art?.material);

  const mesh = new Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
};

export const newMeshFromArtSystem = () => ({
  props: ["art"],
  onAdd: (entity) => {
    if (entity.mesh) return;

    entity.mesh = initializeMesh(entity);
    Object.defineProperty(entity.mesh, "userData", { value: entity });
  },
  onChange: (entity) => {
    entity.mesh!.material = initializeMaterial(entity.art.material);
    entity.mesh!.geometry = initializeGeometry(entity.art.geometry);
  },
} as System<"art">);
