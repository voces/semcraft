import { getClient } from "../contexts/client.ts";
import { Action } from "./util.ts";

export const exit: Action<"exit"> = () => {
  getClient().close();
};
