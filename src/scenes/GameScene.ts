import { AmbientLight, GridHelper, Vector3 } from 'three';
import { BaseScene } from './BaseScene';
import { createPlayer, PlayerHealthComponent } from '../entities/Player';
import { SpawnSystem } from '../systems/SpawnSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { InputManager } from '../core/InputManager';
import { Entity } from '../../lib/threeforge/src/core/Entity';
import { QuarksParticleSystem } from '../effects/QuarksParticleSystem';
import { InventoryComponent } from '../../lib/threeforge/src/inventory/InventoryComponent';
import { createDroppedItem, DroppedItemComponent } from '../items/DroppedItem';
import { getRandomItem, getStarterItems } from '../items/ItemDatabase';
import { Item } from '../../lib/threeforge/src/inventory/Item';
import { UIFloatingText } from '../../lib/three-troika-ui/src';

export class GameScene extends BaseScene {
  private inputManager: InputManager;
  private spawnSystem!: SpawnSystem;
  private collisionSystem!: CollisionSystem;
  private player!: Entity;
  private score: number = 0;
  private particleSystem!: QuarksParticleSystem;
  private droppedItems: Entity[] = [];
  private floatingTexts: UIFloatingText[] = [];

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

    // Setup particle system (Quarks)
    this.particleSystem = new QuarksParticleSystem();
    this.particleSystem.addToScene(this.scene);

    // 플레이어 데미지 콜백 설정
    const playerHealth = this.player.getComponent(PlayerHealthComponent);
    if (playerHealth) {
      playerHealth.onDamage((amount, x, y) => {
        this.spawnDamageText(amount, x, y);
      });
    }

    // Add ground grid for reference
    this.createGroundGrid();

    // 초기 아이템 지급
    this.giveStarterItems();
  }

  /**
   * 시작 아이템 지급
   */
  private giveStarterItems(): void {
    const inventoryComp = this.player.getComponent(InventoryComponent);
    if (!inventoryComp) return;

    const starterItems = getStarterItems();
    for (const itemConfig of starterItems) {
      const item = new Item(itemConfig);
      inventoryComp.addItem(item);
    }
    console.log('Starter items added to inventory');
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
    this.particleSystem.update(deltaTime);
    this.updateFloatingTexts(deltaTime);
  }

  /**
   * 데미지 텍스트 생성
   */
  private spawnDamageText(amount: number, x: number, y: number): void {
    const floatingText = new UIFloatingText({
      text: `-${amount}`,
      fontSize: 0.4,
      color: 0xff4444,
      floatSpeed: 2,
      duration: 0.8,
      outlineWidth: 0.03,
      outlineColor: 0x000000,
      onComplete: () => {
        // 완료 시 제거 예약
      },
    });

    // 약간의 랜덤 오프셋 추가
    const offsetX = (Math.random() - 0.5) * 0.5;
    floatingText.setInitialPosition(x + offsetX, y + 0.5, 1);

    this.scene.add(floatingText);
    this.floatingTexts.push(floatingText);
  }

  /**
   * FloatingText 업데이트 및 정리
   */
  private updateFloatingTexts(deltaTime: number): void {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const text = this.floatingTexts[i];
      text.update(deltaTime);

      if (text.complete) {
        this.scene.remove(text);
        text.dispose();
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  override fixedUpdate(_deltaTime: number): void {
    this.checkCollisions();
    this.checkItemPickup();
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

        // 충돌 위치에서 파티클 이펙트 발생
        const hitPosition = new Vector3(
          (enemy.position.x + this.player.position.x) / 2,
          (enemy.position.y + this.player.position.y) / 2,
          0.5
        );
        this.particleSystem.emitDeathEffect(hitPosition);

        this.spawnSystem.removeEnemy(enemy);
        this.score += 10; // 적 처치 시 점수 증가

        // 아이템 드랍 (100% 확률 - 테스트용)
        this.spawnDroppedItem(enemy.position.clone());
      }
    }
  }

  /**
   * 아이템 드랍
   */
  private spawnDroppedItem(position: Vector3): void {
    const itemConfig = getRandomItem();
    const droppedItem = createDroppedItem(itemConfig, position);

    this.entityManager.add(droppedItem);
    this.droppedItems.push(droppedItem);
  }

  /**
   * 아이템 줍기 체크
   */
  private checkItemPickup(): void {
    const pickupRadius = 0.8;
    const itemsToRemove: Entity[] = [];

    for (const droppedItem of this.droppedItems) {
      const dx = droppedItem.position.x - this.player.position.x;
      const dy = droppedItem.position.y - this.player.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < pickupRadius) {
        // 플레이어 인벤토리에 추가 시도
        const inventoryComp = this.player.getComponent(InventoryComponent);
        const droppedComp = droppedItem.getComponent(DroppedItemComponent);

        if (inventoryComp && droppedComp) {
          const success = inventoryComp.addItem(droppedComp.item);
          if (success) {
            itemsToRemove.push(droppedItem);
            console.log(`Picked up: ${droppedComp.item.name}`);
          }
        }
      }
    }

    // 주운 아이템 제거
    for (const item of itemsToRemove) {
      this.entityManager.remove(item.entityId);
      const index = this.droppedItems.indexOf(item);
      if (index !== -1) {
        this.droppedItems.splice(index, 1);
      }
    }
  }

  getPlayer(): Entity {
    return this.player;
  }

  getPlayerHealth(): { current: number; max: number } {
    const healthComp = this.player.getComponent(PlayerHealthComponent);
    if (healthComp) {
      return { current: healthComp.currentHealth, max: healthComp.maxHealth };
    }
    return { current: 100, max: 100 };
  }

  getScore(): number {
    return this.score;
  }

  getPlayerInventory(): InventoryComponent | null {
    return this.player.getComponent(InventoryComponent) ?? null;
  }

  override destroy(): void {
    super.destroy();
    this.collisionSystem.clear();
    this.spawnSystem.clear();
    this.particleSystem.dispose();
    this.droppedItems = [];

    // FloatingText 정리
    for (const text of this.floatingTexts) {
      this.scene.remove(text);
      text.dispose();
    }
    this.floatingTexts = [];
  }
}
