import { newClient } from "./bridge.ts";

globalThis.addEventListener(
  "connect",
  (e) => {
    const port = (e as MessageEvent).ports[0];
    port.start();
    newClient(port, (x, y) => port.postMessage({ action: "startNode", x, y }));
  },
);
