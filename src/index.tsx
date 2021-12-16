import { Fragment, h, render } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import {
  HemisphereLight,
  NearestFilter,
  PerspectiveCamera,
  Scene,
  Sprite,
  SpriteMaterial,
  TextureLoader,
  WebGLRenderer,
} from "three";

const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new Scene();
    const camera = new PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );

    const renderer = new WebGLRenderer({ canvas: canvasRef.current });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const light = new HemisphereLight(0xffffbb, 0x080820, 1);
    scene.add(light);

    const grassMaterials = Array.from(
      Array(20),
      (_, i) => {
        const map = new TextureLoader().load(`assets/grass${i + 1}.png`);
        map.minFilter = NearestFilter;
        map.magFilter = NearestFilter;
        return new SpriteMaterial({ map });
      },
    );

    const HEIGHT = 10;
    const WIDTH = 10;
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        const sprite = new Sprite(
          grassMaterials[Math.floor(Math.random() * 3)],
        );
        sprite.position.x = x / 2 - y / 2;
        sprite.position.y = -x / 4 - y / 4 + (HEIGHT / 4);
        scene.add(sprite);
      }
    }

    camera.position.z = (HEIGHT / 4) + WIDTH / 2;

    const animate = function () {
      requestAnimationFrame(animate);

      renderer.render(scene, camera);
    };

    animate();

    globalThis.addEventListener("resize", () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    });
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

render(<App />, document.body);
