import { createContext } from "preact";
import { Semcraft } from "../../semcraft.ts";

export const SemcraftContext = createContext<Semcraft>(
  null as unknown as Semcraft,
);
