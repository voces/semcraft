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
      // deno-lint-ignore no-explicit-any
      keys.map((key) =>
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
const maps = new Set<Map<string, WeakRef<object>>>();

export const memoize = <
  Args extends unknown[],
  // deno-lint-ignore ban-types
  Return extends object,
>(
  fn: (...args: Args) => Return,
) => {
  const map = new Map<string, WeakRef<Return>>();
  maps.add(map);
  return (...args: Args) => {
    const key = orderedStringify(args);

    const existingValue = map.get(key)?.deref();
    if (existingValue !== undefined) return existingValue;

    const newValue = fn(...args);
    map.set(key, new WeakRef(newValue));
    return newValue;
  };
};

let outer = maps.values();
const temp = outer.next();
let map = temp.done ? undefined : temp.value;
// deno-lint-ignore ban-types
let inner = map ? map.entries() : new Map<string, WeakRef<object>>().entries();

setInterval(() => {
  let iterations = 1000;

  do {
    let next = inner.next();

    if (next.done) {
      let temp = outer.next();
      if (temp.done) {
        outer = maps.values();
        temp = outer.next();
        if (temp.done) break; // maps is empty
      }
      map = temp.value;
      inner = temp.value.entries();
      next = inner.next();
    }

    if (next.done) continue; // a map is empty

    const [key, ref] = next.value;

    if (!ref.deref()) map?.delete(key);
  } while (iterations--);
}, 100);
