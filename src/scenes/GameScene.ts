import { AmbientLight, GridHelper } from 'three';
import { BaseScene } from './BaseScene';
import { createPlayer, PlayerHealthComponent } from '../entities/Player';
import { SpawnSystem } from '../systems/SpawnSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { InputManager } from '../core/InputManager';
import { Entity } from '../../lib/threeforge/src/core/Entity';

export class GameScene extends BaseScene {
  private inputManager: InputManager;
  private spawnSystem!: SpawnSystem;
  private collisionSystem!: CollisionSystem;
  private player!: Entity;

  constructor(inputManager: InputManager) {
    super();
    this.inputManager = inputManager;
  }

  async init(): Promise<void> {
    // Add ambient light
    const ambientLight = new AmbientLight(0xffffff, 1);
    this.scene.add(ambientLight);

    // Create player
    this.player = createPlayer(this.inputManager);
    this.entityManager.add(this.player);

    // Setup collision system
    this.collisionSystem = new CollisionSystem();
    this.collisionSystem.addCollider(this.player, 0.5, 'player');

    // Setup spawn system
    this.spawnSystem = new SpawnSystem(this.scene, {
      spawnRate: 0.5,
      maxEnemies: 30,
      spawnRadius: 15,
      minSpawnDistance: 10,
    });
    this.spawnSystem.setTarget(this.player);

    // Add ground grid for reference
    this.createGroundGrid();
  }

  private createGroundGrid(): void {
    // Simple grid pattern for visual reference
    const gridHelper = new GridHelper(50, 50, 0x333333, 0x222222);
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.position.z = -0.1;
    this.scene.add(gridHelper);
  }

  override update(deltaTime: number): void {
    super.update(deltaTime);
    this.spawnSystem.update(deltaTime);
  }

  override fixedUpdate(_deltaTime: number): void {
    this.checkCollisions();
  }

  private checkCollisions(): void {
    // Check enemy-player collisions
    const enemies = this.spawnSystem.getActiveEnemies();
    for (const enemy of enemies) {
      const dx = enemy.position.x - this.player.position.x;
      const dy = enemy.position.y - this.player.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 0.9) {
        // Enemy touched player
        const playerHealth = this.player.getComponent(PlayerHealthComponent);
        if (playerHealth) {
          playerHealth.takeDamage(10);
        }
        this.spawnSystem.removeEnemy(enemy);
      }
    }
  }

  getPlayer(): Entity {
    return this.player;
  }

  override destroy(): void {
    super.destroy();
    this.collisionSystem.clear();
    this.spawnSystem.clear();
  }
}
