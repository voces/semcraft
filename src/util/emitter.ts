export type EventMap = {
  // deno-lint-ignore no-explicit-any
  [name: string]: (...args: any[]) => void;
};

type EventMapArray<Events> = {
  [Event in keyof Events]?: Events[Event][];
};

export interface Emitter<Events extends EventMap> {
  addEventListener: <Event extends keyof Events>(
    name: Event,
    callback: Events[Event],
  ) => void;
  removeEventListener: <Event extends keyof Events>(
    name: Event,
    callback: Events[Event],
  ) => void;
  removeEventListeners: <Event extends keyof Events>(name?: Event) => void;
  dispatchEvent: <Event extends keyof Events>(
    name: Event,
    ...args: Parameters<Events[Event]>
  ) => void;
}

// deno-lint-ignore no-explicit-any
const map = new WeakMap<any, EventMapArray<unknown>>();

export const emitter = <T, Events extends EventMap>(
  host: T,
): T & Emitter<Events> => {
  let events: EventMapArray<Events> = map.get(host) as EventMapArray<Events>;
  if (!events) {
    events = {};
    map.set(host, events);
  }

  const modifiedHost = host as T & Emitter<Events>;

  if (!modifiedHost.addEventListener) {
    modifiedHost.addEventListener = <Event extends keyof Events>(
      name: Event,
      callback: Events[Event],
    ) => {
      const callbacks: Events[Event][] = events[name] ?? [];

      if (!events[name]) events[name] = callbacks;

      callbacks.push(callback);
    };
  }

  if (!modifiedHost.removeEventListener) {
    modifiedHost.removeEventListener = <Event extends keyof Events>(
      name: Event,
      callback: Events[Event],
    ) => {
      const callbacks: Events[Event][] | undefined = events[name] ?? undefined;
      if (!callbacks) return;

      const index = callbacks.indexOf(callback);
      if (index >= 0) callbacks.splice(index, 1);
    };
  }

  if (!modifiedHost.removeEventListeners) {
    modifiedHost.removeEventListeners = (name) => {
      if (!name) {
        events = {};
        map.set(host, events);
        return;
      }

      events[name] = [];
    };
  }

  if (!modifiedHost.dispatchEvent) {
    modifiedHost.dispatchEvent = <Event extends keyof Events>(
      name: Event,
      ...args: Parameters<Events[Event]>
    ) => {
      const callbacks: Events[Event][] | undefined = events[name] ?? undefined;
      if (!callbacks) return;

      callbacks.forEach((callback) => callback.apply(host, args));
    };
  }

  return modifiedHost;
};
