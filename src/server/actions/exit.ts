import { Action } from "./util.ts";

export const exit: Action<"exit"> = () => {
  console.log("client close!");
};
