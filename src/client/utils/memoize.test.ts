import { memoize } from "./memoize.ts";
import {
  assertEquals,
  assertNotStrictEquals,
  assertStrictEquals,
} from "std/testing/asserts.ts";

Deno.test("simple", () => {
  const fn = (value: number) => ({ ret: value * 2 });
  const memoizedFn = memoize(fn);

  const a = memoizedFn(2);
  const b = memoizedFn(3);
  const c = memoizedFn(2);

  assertEquals(a, { ret: 4 });
  assertStrictEquals(a, c);
  assertNotStrictEquals(a, b);
});

Deno.test("multiple args", () => {
  const fn = (a: number, b: number) => ({ ret: a * b });
  const memoizedFn = memoize(fn);

  const a = memoizedFn(2, 3);
  const b = memoizedFn(3, 2);
  const c = memoizedFn(2, 3);

  assertEquals(a, { ret: 6 });
  assertEquals(b, { ret: 6 });
  assertStrictEquals(a, c);
  assertNotStrictEquals(a, b);
});
