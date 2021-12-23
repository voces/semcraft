import { currentApp, withApp, wrapApp } from "./core/appContext.ts";
import type { Semcraft } from "./semcraft.ts";

export const withSemcraft = <T>(
  semcraft: Semcraft,
  fn: (semcraft: Semcraft) => T,
): Promise<T> => withApp(semcraft, fn);

export const wrapSemcraft = <Args extends unknown[], Return extends unknown>(
  semcraft: Semcraft,
  fn: (...args: Args) => Return,
): ((...args: Args) => Promise<Return>) => wrapApp(semcraft, fn);

export const currentSemcraft = (): Semcraft => {
  const app = currentApp();
  // TODO: maybe add isSemcraft and a typeguard instead of casting?
  if (!app) throw new Error("Expected a Semcraft context");
  return app as Semcraft;
};
