import { exit } from "./exit.ts";
import { firebolt } from "./firebolt.ts";
import { move } from "./move.ts";

export type { Action } from "./util.ts";

// const debounce = (fn: () => void, debounce = 100) => {
//   let last = -Infinity;
//   let debouncing = false;

//   return () => {
//     const now = Date.now();

//     // Debouncing, wait
//     if (debouncing) return;

//     // Hasn't been hit in a while, invoke immediately
//     if (now - last > debounce) {
//       last = now;
//       return fn();
//     }
//     last = now;

//     debouncing = true;
//     setTimeout(() => {
//       debouncing = false;
//       fn();
//     }, last + debounce);
//   };
// };

export const actions = {
  move,
  firebolt,
  exit,
};
