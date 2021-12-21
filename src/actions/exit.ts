import { action } from "./util.ts";

export const exit = (() => {
  return action({
    clientHandler: () => ({ action: "exit" }),
    serverHandler: () => {
      console.log("client close!");
    },
  });
})();
