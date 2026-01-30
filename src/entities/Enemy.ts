import { Entity } from '../../lib/threeforge/src/core/Entity';
import { Component } from '../../lib/threeforge/src/core/Component';
import { Poolable } from '../core/ObjectPool';
import {
  PlaneGeometry,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  TextureLoader,
  SRGBColorSpace,
  Texture,
} from 'three';

// 적 텍스처 캐시 (한 번만 로드)
let enemyTexture: Texture | null = null;
const textureLoader = new TextureLoader();

function getEnemyTexture(): Promise<Texture> {
  if (enemyTexture) {
    return Promise.resolve(enemyTexture);
  }
  return new Promise((resolve) => {
    textureLoader.load('/assets/sprites/enemy.svg', (texture) => {
      texture.colorSpace = SRGBColorSpace;
      enemyTexture = texture;
      resolve(texture);
    });
  });
}

export class EnemyMovementComponent extends Component {
  speed: number = 2;
  target: Object3D | null = null;

  override update(deltaTime: number): void {
    if (!this.entity || !this.target) return;

    const dx = this.target.position.x - this.entity.position.x;
    const dy = this.target.position.y - this.entity.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0.1) {
      const moveX = (dx / distance) * this.speed * deltaTime;
      const moveY = (dy / distance) * this.speed * deltaTime;
      this.entity.position.x += moveX;
      this.entity.position.y += moveY;
    }
  }
}

export class EnemyHealthComponent extends Component {
  maxHealth: number = 30;
  currentHealth: number = 30;

  takeDamage(amount: number): boolean {
    this.currentHealth -= amount;
    return this.currentHealth <= 0;
  }

  reset(): void {
    this.currentHealth = this.maxHealth;
  }
}

export class Enemy extends Entity implements Poolable {
  private _poolActive: boolean = false;
  private material: MeshBasicMaterial;

  constructor() {
    super({
      tags: ['enemy'],
    });

    // Create enemy with SVG texture
    const geometry = new PlaneGeometry(0.8, 0.8);
    this.material = new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
    });
    const mesh = new Mesh(geometry, this.material);
    this.add(mesh);

    // Load texture (캐시된 텍스처 사용)
    getEnemyTexture().then((texture) => {
      this.material.map = texture;
      this.material.needsUpdate = true;
    });

    // Add components
    this.addComponent(new EnemyMovementComponent());
    this.addComponent(new EnemyHealthComponent());
  }

  get active(): boolean {
    return this._poolActive;
  }

  set active(value: boolean) {
    this._poolActive = value;
    this.visible = value;
  }

  reset(): void {
    const health = this.getComponent(EnemyHealthComponent);
    if (health) {
      health.reset();
    }
    this.position.set(0, 0, 0);
  }

  setTarget(target: Object3D): void {
    const movement = this.getComponent(EnemyMovementComponent);
    if (movement) {
      movement.target = target;
    }
  }
}

export function createEnemyFactory(): () => Enemy {
  return () => new Enemy();
}
