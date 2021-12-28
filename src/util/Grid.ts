const clamp = (min: number, value: number, max: number) =>
  value < min ? min : value > max ? max : value;

// TODO: Allow bounding boxes/radius
export class Grid<T extends { x: number; y: number }> {
  cells: (Set<T> | undefined)[][];
  #min: number;
  #range: number;
  #map = new Map<T, Set<T>>();
  #iStep: number;
  #count: number;

  // TODO: remove min/max by using a double sided array structure and cell size
  constructor(min: number, max: number, count = (max - min)) {
    this.#range = max - min;
    this.#min = min;
    this.#iStep = count / this.#range;
    this.#count = count;

    this.cells = [];
    for (let y = 0; y < count; y++) this.cells[y] = [];
  }

  #cellIndex(x: number, y: number) {
    return [
      clamp(
        0,
        Math.floor((x - this.#min) * this.#iStep),
        this.cells.length - 1,
      ),
      clamp(
        0,
        Math.floor((y - this.#min) * this.#iStep),
        this.cells.length - 1,
      ),
    ];
  }

  add(item: T) {
    const [xCell, yCell] = this.#cellIndex(item.x, item.y);
    const cell = this.cells[yCell][xCell] ??
      (this.cells[yCell][xCell] = new Set());

    cell.add(item);
    this.#map.set(item, cell);
  }

  update(item: T) {
    const [xCell, yCell] = this.#cellIndex(item.x, item.y);
    const newCell = this.cells[yCell][xCell] ??
      (this.cells[yCell][xCell] = new Set());
    const oldCell = this.#map.get(item);

    if (oldCell) {
      if (oldCell !== newCell) {
        oldCell.delete(item);
        newCell.add(item);
        this.#map.set(item, newCell);
      }
    } else {
      newCell.add(item);
      this.#map.set(item, newCell);
    }
  }

  delete(item: T) {
    this.#map.get(item)?.delete(item);
    this.#map.delete(item);
  }

  // TODO: We could exclude entire cell checks by checking if the cell is in
  // range
  *queryPoint(x: number, y: number, radius: number, simple = false) {
    const range = this.queryRange(
      x - radius,
      y - radius,
      x + radius,
      y + radius,
    );

    // Just return whole cells
    if (simple) yield* range;

    const radiusSquared = radius ** 2;

    for (const item of range) {
      const distSquared = (item.x - x) ** 2 + (item.y - y) ** 2;
      if (distSquared <= radiusSquared) {
        yield item;
      }
    }
  }

  *queryRange(xMin: number, yMin: number, xMax: number, yMax: number) {
    const [xStart, yStart] = this.#cellIndex(xMin, yMin);
    const [xEnd, yEnd] = this.#cellIndex(xMax, yMax);

    for (let y = yStart; y <= yEnd; y++) {
      for (let x = xStart; x <= xEnd; x++) {
        if (this.cells[y][x]) {
          for (const item of this.cells[y][x]!) yield item;
        }
      }
    }
  }

  clear() {
    this.#map = new Map();
    this.cells = [];
    for (let y = 0; y < this.#count; y++) this.cells[y] = [];
  }
}
