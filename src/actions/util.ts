export type Action<T> = {
  clientHandler: () => T | undefined;
  clientDebounce?: number;
  serverHandler: (data: T) => void;
};

// For type happiness
export const action = <T>(action: Action<T>) => action;
