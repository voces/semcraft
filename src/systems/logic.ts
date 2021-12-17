import { Mesh, MeshPhongMaterial, SphereGeometry } from "three";
import { currentSemcraft } from "../Semcraft.ts";
import { tiles } from "./tiles.ts";
import "./controls.ts";

export const logic = () => {
  const semcraft = currentSemcraft();

  tiles();

  semcraft.add({
    x: 0,
    y: 0,
    mesh: new Mesh(new SphereGeometry(1 / 2), new MeshPhongMaterial()),
  });
  semcraft.add({ x: 5, y: 0 });
  semcraft.add({ x: 0, y: 5 });
  semcraft.add({ x: -5, y: 0 });
  semcraft.add({ x: 0, y: -5 });

  //   semcraft.add(tiles());

  return {
    // onUpdate: () => {

    // },
  };
};
