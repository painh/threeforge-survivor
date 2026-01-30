import { Scene } from 'three';
import { EntityManager } from '../../lib/threeforge/src/core/EntityManager';

export abstract class BaseScene {
  readonly scene: Scene;
  readonly entityManager: EntityManager;

  constructor() {
    this.scene = new Scene();
    this.entityManager = new EntityManager(this.scene);
  }

  abstract init(): Promise<void>;

  update(deltaTime: number): void {
    this.entityManager.update(deltaTime);
  }

  fixedUpdate(_deltaTime: number): void {}

  destroy(): void {
    this.entityManager.clear();
  }
}
