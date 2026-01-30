export interface Poolable {
  reset(): void;
  active: boolean;
}

export class ObjectPool<T extends Poolable> {
  private pool: T[] = [];
  private factory: () => T;
  private maxSize: number;

  constructor(factory: () => T, initialSize: number = 0, maxSize: number = 1000) {
    this.factory = factory;
    this.maxSize = maxSize;

    for (let i = 0; i < initialSize; i++) {
      const obj = this.factory();
      obj.active = false;
      this.pool.push(obj);
    }
  }

  acquire(): T {
    // Find inactive object in pool
    for (const obj of this.pool) {
      if (!obj.active) {
        obj.active = true;
        obj.reset();
        return obj;
      }
    }

    // Create new object if pool isn't full
    if (this.pool.length < this.maxSize) {
      const obj = this.factory();
      obj.active = true;
      this.pool.push(obj);
      return obj;
    }

    // Pool is full, reuse oldest active object
    const obj = this.pool[0];
    obj.reset();
    return obj;
  }

  release(obj: T): void {
    obj.active = false;
  }

  releaseAll(): void {
    for (const obj of this.pool) {
      obj.active = false;
    }
  }

  getActive(): T[] {
    return this.pool.filter((obj) => obj.active);
  }

  getActiveCount(): number {
    return this.pool.filter((obj) => obj.active).length;
  }

  getTotalCount(): number {
    return this.pool.length;
  }

  forEach(callback: (obj: T) => void): void {
    for (const obj of this.pool) {
      if (obj.active) {
        callback(obj);
      }
    }
  }
}
