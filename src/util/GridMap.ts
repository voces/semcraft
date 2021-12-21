import { Grid } from "./Grid.ts";

export class GridMap<K, T extends { x: number; y: number }> extends Grid<T> {
  #keyMap = new Map<K, T>();

  set(key: K, item: T) {
    const oldItem = this.#keyMap.get(key);
    if (oldItem) this.delete(oldItem);

    this.#keyMap.set(key, item);
    this.add(item);
  }

  patch(key: K, item: Partial<T>) {
    const oldItem = this.#keyMap.get(key);
    // Found the old item, patch it and update
    if (oldItem) {
      Object.assign(oldItem, item);
      this.update(oldItem);
    } else {
      throw new Error(
        "Attempted to patch missing item. Call GridMap#set first.",
      );
    }
  }

  remove(key: K) {
    const oldItem = this.#keyMap.get(key);
    if (oldItem) this.delete(oldItem);
    this.#keyMap.delete(key);
  }

  get(key: K) {
    return this.#keyMap.get(key);
  }

  has(key: K) {
    return this.#keyMap.has(key);
  }

  get size() {
    return this.#keyMap.size;
  }

  clear() {
    this.#keyMap.clear();
    super.clear();
  }
}
