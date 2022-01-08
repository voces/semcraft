import { newNode } from "./node.ts";

globalThis.addEventListener(
  "connect",
  (e) => {
    const port = (e as MessageEvent).ports[0];
    port.start();
    port.addEventListener("message", (ev) => {
      const { x, y } = ev.data;
      newNode(x, y);
    });
  },
);
