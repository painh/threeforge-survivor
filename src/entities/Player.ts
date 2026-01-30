import { Entity } from '../../lib/threeforge/src/core/Entity';
import { Component } from '../../lib/threeforge/src/core/Component';
import { InventoryComponent } from '../../lib/threeforge/src/inventory/InventoryComponent';
import { DEFAULT_EQUIPMENT_SLOTS } from '../../lib/threeforge/src/inventory/Equipment';
import { InputManager } from '../core/InputManager';
import {
  PlaneGeometry,
  Mesh,
  MeshBasicMaterial,
  TextureLoader,
  SRGBColorSpace,
} from 'three';

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

export type DamageCallback = (amount: number, x: number, y: number) => void;

export class PlayerHealthComponent extends Component {
  maxHealth: number = 100;
  currentHealth: number = 100;
  private onDamageCallback: DamageCallback | null = null;

  /**
   * 데미지 발생 시 콜백 설정
   */
  onDamage(callback: DamageCallback): void {
    this.onDamageCallback = callback;
  }

  takeDamage(amount: number): void {
    this.currentHealth = Math.max(0, this.currentHealth - amount);

    // 데미지 콜백 호출
    if (this.onDamageCallback && this.entity) {
      this.onDamageCallback(amount, this.entity.position.x, this.entity.position.y);
    }

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

  // Create player with SVG texture
  const geometry = new PlaneGeometry(1, 1);
  const material = new MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
  });
  const mesh = new Mesh(geometry, material);
  player.add(mesh);

  // Load SVG texture
  const loader = new TextureLoader();
  loader.load('/assets/sprites/player.svg', (texture) => {
    texture.colorSpace = SRGBColorSpace;
    material.map = texture;
    material.needsUpdate = true;
  });

  // Add components
  player.addComponent(new PlayerMovementComponent(inputManager));
  player.addComponent(new PlayerHealthComponent());

  // 인벤토리 컴포넌트 (10x4 그리드 + 기본 장비 슬롯) - 디아블로 스타일
  player.addComponent(
    new InventoryComponent({
      inventory: { width: 10, height: 4 },
      equipment: DEFAULT_EQUIPMENT_SLOTS,
    })
  );

  return player;
}
