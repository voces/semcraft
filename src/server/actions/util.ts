import type { ClientActions } from "../../client/actions/index.ts";

export type Action<T extends keyof ClientActions> = (
  action: NonNullable<ReturnType<ClientActions[T]>>,
) => void;
