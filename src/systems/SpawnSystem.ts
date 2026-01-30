import { Object3D, Scene } from 'three';
import { ObjectPool } from '../core/ObjectPool';
import { Enemy, createEnemyFactory } from '../entities/Enemy';

export interface SpawnConfig {
  spawnRate: number; // enemies per second
  maxEnemies: number;
  spawnRadius: number;
  minSpawnDistance: number;
}

export class SpawnSystem {
  private pool: ObjectPool<Enemy>;
  private scene: Scene;
  private target: Object3D | null = null;
  private config: SpawnConfig;
  private spawnTimer: number = 0;

  constructor(scene: Scene, config: Partial<SpawnConfig> = {}) {
    this.scene = scene;
    this.config = {
      spawnRate: config.spawnRate ?? 1,
      maxEnemies: config.maxEnemies ?? 50,
      spawnRadius: config.spawnRadius ?? 12,
      minSpawnDistance: config.minSpawnDistance ?? 8,
    };

    this.pool = new ObjectPool(createEnemyFactory(), 10, this.config.maxEnemies);
  }

  setTarget(target: Object3D): void {
    this.target = target;
  }

  update(deltaTime: number): void {
    if (!this.target) return;

    this.spawnTimer += deltaTime;
    const spawnInterval = 1 / this.config.spawnRate;

    while (this.spawnTimer >= spawnInterval) {
      this.spawnTimer -= spawnInterval;

      if (this.pool.getActiveCount() < this.config.maxEnemies) {
        this.spawnEnemy();
      }
    }

    // Update active enemies
    this.pool.forEach((enemy) => {
      enemy.update(deltaTime);
    });
  }

  private spawnEnemy(): void {
    if (!this.target) return;

    const enemy = this.pool.acquire();

    // Random position in a ring around the player
    const angle = Math.random() * Math.PI * 2;
    const distance =
      this.config.minSpawnDistance +
      Math.random() * (this.config.spawnRadius - this.config.minSpawnDistance);

    enemy.position.x = this.target.position.x + Math.cos(angle) * distance;
    enemy.position.y = this.target.position.y + Math.sin(angle) * distance;
    enemy.position.z = 0;

    enemy.setTarget(this.target);

    if (!enemy.parent) {
      this.scene.add(enemy);
    }
  }

  removeEnemy(enemy: Enemy): void {
    this.pool.release(enemy);
    enemy.visible = false;
  }

  getActiveEnemies(): Enemy[] {
    return this.pool.getActive();
  }

  getActiveCount(): number {
    return this.pool.getActiveCount();
  }

  clear(): void {
    this.pool.forEach((enemy) => {
      this.scene.remove(enemy);
    });
    this.pool.releaseAll();
  }
}
