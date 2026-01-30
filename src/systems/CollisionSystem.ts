import { Object3D, Vector3 } from 'three';

export interface Collider {
  object: Object3D;
  radius: number;
  tag: string;
}

export interface CollisionEvent {
  a: Collider;
  b: Collider;
  distance: number;
}

export class CollisionSystem {
  private colliders: Collider[] = [];
  private tempVec = new Vector3();

  addCollider(object: Object3D, radius: number, tag: string): Collider {
    const collider: Collider = { object, radius, tag };
    this.colliders.push(collider);
    return collider;
  }

  removeCollider(collider: Collider): void {
    const index = this.colliders.indexOf(collider);
    if (index !== -1) {
      this.colliders.splice(index, 1);
    }
  }

  removeByObject(object: Object3D): void {
    this.colliders = this.colliders.filter((c) => c.object !== object);
  }

  checkCollisions(tagA: string, tagB: string): CollisionEvent[] {
    const collisions: CollisionEvent[] = [];

    const groupA = this.colliders.filter((c) => c.tag === tagA && c.object.visible);
    const groupB = this.colliders.filter((c) => c.tag === tagB && c.object.visible);

    for (const a of groupA) {
      for (const b of groupB) {
        if (a === b) continue;

        const distance = this.getDistance(a.object, b.object);
        const minDistance = a.radius + b.radius;

        if (distance < minDistance) {
          collisions.push({ a, b, distance });
        }
      }
    }

    return collisions;
  }

  checkCollision(a: Collider, b: Collider): boolean {
    if (!a.object.visible || !b.object.visible) return false;

    const distance = this.getDistance(a.object, b.object);
    return distance < a.radius + b.radius;
  }

  getCollisionsFor(collider: Collider, tag: string): Collider[] {
    const results: Collider[] = [];
    const others = this.colliders.filter((c) => c.tag === tag && c !== collider && c.object.visible);

    for (const other of others) {
      if (this.checkCollision(collider, other)) {
        results.push(other);
      }
    }

    return results;
  }

  private getDistance(a: Object3D, b: Object3D): number {
    this.tempVec.subVectors(a.position, b.position);
    return this.tempVec.length();
  }

  clear(): void {
    this.colliders = [];
  }
}
