import { Entity } from '../../lib/threeforge/src/core/Entity';
import { Component } from '../../lib/threeforge/src/core/Component';
import { InputManager } from '../core/InputManager';
import { PlaneGeometry, Mesh, MeshBasicMaterial } from 'three';

export class PlayerMovementComponent extends Component {
  speed: number = 5;
  private inputManager: InputManager;

  constructor(inputManager: InputManager) {
    super();
    this.inputManager = inputManager;
  }

  override update(deltaTime: number): void {
    if (!this.entity) return;

    const movement = this.inputManager.getMovementVector();
    this.entity.position.x += movement.x * this.speed * deltaTime;
    this.entity.position.y += movement.y * this.speed * deltaTime;
  }
}

export class PlayerHealthComponent extends Component {
  maxHealth: number = 100;
  currentHealth: number = 100;

  takeDamage(amount: number): void {
    this.currentHealth = Math.max(0, this.currentHealth - amount);
    if (this.currentHealth <= 0) {
      this.onDeath();
    }
  }

  heal(amount: number): void {
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
  }

  private onDeath(): void {
    console.log('Player died!');
  }
}

export function createPlayer(inputManager: InputManager): Entity {
  const player = new Entity({
    name: 'player',
    tags: ['player', 'character'],
  });

  // Create a simple colored quad for the player
  const geometry = new PlaneGeometry(1, 1);
  const material = new MeshBasicMaterial({ color: 0x4488ff });
  const mesh = new Mesh(geometry, material);
  player.add(mesh);

  // Add components
  player.addComponent(new PlayerMovementComponent(inputManager));
  player.addComponent(new PlayerHealthComponent());

  return player;
}
