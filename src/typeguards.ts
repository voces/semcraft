export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && !!value;

export const isArray = (value: unknown): value is unknown[] =>
  Array.isArray(value);
