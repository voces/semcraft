const escapeKey = (key: string): string =>
  key.match(/^[_a-zA-Z][_0-9a-zA-Z]*$/) ? key : `"${key.replace(/"/g, "\\")}"`;

const orderedStringify = (value: unknown): string => {
  if (typeof value === "object") {
    if (value === null) return "null";

    if (Array.isArray(value)) {
      return `[${value.map((v) => orderedStringify(v)).join(",")}]`;
    }

    const keys = Object.keys(value).sort();
    return `{${
      keys.map((key) =>
        // deno-lint-ignore no-explicit-any
        `${escapeKey(key)}:${orderedStringify((value as any)[key])}`
      ).join(
        ",",
      )
    }}`;
  }

  if (value === undefined) return "undefined";

  if (typeof value === "string") {
    if (!value.includes('"')) return `"${value}"`;
    if (!value.includes('"')) return `'${value}'`;
    return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }

  // deno-lint-ignore no-explicit-any
  return (value as any).toString();
};

// NOTE: this prevents proper cleanup. We can probably do proper cleanup by
// also weakref'ing the function itself
// deno-lint-ignore ban-types
const maps = new Set<[Map<string, WeakRef<object>>, WeakRef<Function>]>();

export const memoize = <
  Args extends unknown[],
  // deno-lint-ignore ban-types
  Return extends object,
>(
  fn: (...args: Args) => Return,
) => {
  const map = new Map<string, WeakRef<Return>>();
  const wrapped = (...args: Args) => {
    const key = orderedStringify(args);

    const existingValue = map.get(key)?.deref();
    if (existingValue !== undefined) return existingValue;

    const newValue = fn(...args);
    map.set(key, new WeakRef(newValue));
    return newValue;
  };

  maps.add([map, new WeakRef(wrapped)]);
  return wrapped;
};

let outer = maps.values();
const temp = outer.next();
let [map, fn] = temp.done ? [] : temp.value;
// deno-lint-ignore ban-types
let inner = map ? map.entries() : new Map<string, WeakRef<object>>().entries();
let firstMap = map;

setInterval(() => {
  let iterations = 1000;

  do {
    let next = inner.next();

    if (next.done) {
      // Get next Map
      let temp = outer.next();
      if (temp.done) {
        outer = maps.values();
        temp = outer.next();
        if (temp.done) break; // There are no Maps
      }

      [map, fn] = temp.value;

      // The memoized function is no longer in memory, delete the map
      if (!fn.deref()) maps.delete(temp.value);

      if (map === firstMap) break; // Looped around all Maps
      if (!firstMap) firstMap = map;

      inner = map.entries();
      next = inner.next();
    }

    if (next.done) continue; // The Map is empty, continue to next

    const [key, ref] = next.value;

    if (!ref.deref()) map?.delete(key);
  } while (iterations--);
}, 100);
