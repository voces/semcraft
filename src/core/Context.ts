// deno-lint-ignore ban-types
type InnerMap = WeakMap<Function, unknown>;

// deno-lint-ignore ban-types
export class Context<T extends object | undefined> {
  private _current: T;
  // deno-lint-ignore ban-types
  private memory = new WeakMap<object, InnerMap>();

  constructor(context: T) {
    this._current = context;
  }

  get current(): T {
    return this._current;
  }

  /** This should not be used. Just here for initial development. Instead use
   * Context#with.
   */
  _setCurrent(context: T): T {
    this._current = context;
    return context;
  }

  with<A, B extends T>(context: B, fn: (context: B) => A): A {
    const old = this._current;
    this._current = context;
    const ret = fn(context);
    this._current = old;
    return ret;
  }

  wrap<Passed extends T, Args extends unknown[], Return extends unknown>(
    context: Passed,
    fn: (...args: Args) => Return,
  ): (...args: Args) => Return {
    if (!context) throw new Error("Expected context");

    let innerMemory: InnerMap;
    if (!this.memory.has(context)) {
      innerMemory = new WeakMap();
      this.memory.set(context, innerMemory);
    } else innerMemory = this.memory.get(context)!;

    // deno-lint-ignore no-explicit-any
    if (innerMemory.has(fn)) return innerMemory.get(fn) as any;

    const wrapped = (...args: Args) => this.with(context, () => fn(...args));
    innerMemory.set(fn, wrapped);
    return wrapped;
  }

  wrapCurrent<Passed extends T, Args extends unknown[], Return extends unknown>(
    fn: (...args: Args) => Return,
  ): (...args: Args) => Return {
    return this.wrap(this.current, fn);
  }
}
