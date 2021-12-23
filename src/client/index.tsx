import { h, render } from "preact";
import { HUD } from "./components/HUD.tsx";

render(<HUD />, document.body);

globalThis.addEventListener("contextmenu", (e) => e.preventDefault());
