import * as THREE from 'three';
import { Entity } from '../../lib/threeforge/src/core/Entity';
import { Component } from '../../lib/threeforge/src/core/Component';
import { Item, ItemConfig, ItemRarity } from '../../lib/threeforge/src/inventory/Item';

/**
 * 드랍 아이템 컴포넌트
 * 바닥에 떨어진 아이템 표현
 */
export class DroppedItemComponent extends Component {
  readonly item: Item;

  // 애니메이션
  private bobTime: number = 0;
  private initialY: number = 0;

  constructor(itemConfig: ItemConfig, quantity: number = 1) {
    super();
    this.item = new Item(itemConfig, quantity);
  }

  override onAttach(): void {
    if (this.entity) {
      this.initialY = this.entity.position.y;
    }
  }

  override update(deltaTime: number): void {
    if (!this.entity) return;

    // 위아래로 떠다니는 애니메이션
    this.bobTime += deltaTime * 3;
    this.entity.position.y = this.initialY + Math.sin(this.bobTime) * 0.1;

    // 천천히 회전
    this.entity.rotation.z += deltaTime * 0.5;
  }
}

/**
 * 레리티에 따른 색상 반환
 */
function getRarityColor(rarity: ItemRarity): number {
  const colors: Record<ItemRarity, number> = {
    common: 0x9d9d9d,
    uncommon: 0x1eff00,
    rare: 0x0070dd,
    epic: 0xa335ee,
    legendary: 0xff8000,
  };
  return colors[rarity];
}

/**
 * 드랍 아이템 Entity 생성
 */
export function createDroppedItem(
  itemConfig: ItemConfig,
  position: THREE.Vector3,
  quantity: number = 1
): Entity {
  const droppedItem = new Entity({
    name: `dropped_${itemConfig.id}`,
    tags: ['dropped_item', 'pickup'],
  });

  droppedItem.position.copy(position);

  // 간단한 시각적 표현 (사각형 + 글로우)
  const size = 0.4;
  const color = getRarityColor(itemConfig.rarity ?? 'common');

  // 배경 (글로우 효과)
  const glowGeometry = new THREE.PlaneGeometry(size * 1.5, size * 1.5);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.3,
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  glow.position.z = -0.01;
  droppedItem.add(glow);

  // 아이템 아이콘 (사각형)
  const geometry = new THREE.PlaneGeometry(size, size);
  const material = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
  });
  const mesh = new THREE.Mesh(geometry, material);
  droppedItem.add(mesh);

  // 드랍 아이템 컴포넌트 추가
  droppedItem.addComponent(new DroppedItemComponent(itemConfig, quantity));

  return droppedItem;
}
