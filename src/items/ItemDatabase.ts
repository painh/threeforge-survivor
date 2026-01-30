import { ItemConfig, ItemRarity } from '../../lib/threeforge/src/inventory/Item';

/**
 * 게임 내 아이템 정의
 */
export const ITEM_DATABASE: Record<string, ItemConfig> = {
  // 무기류
  sword_basic: {
    id: 'sword_basic',
    name: 'Iron Sword',
    description: 'A basic iron sword.',
    width: 1,
    height: 2,
    rarity: 'common',
    equipSlot: 'mainHand',
    icon: '/icons/sword.png',
    stats: {
      attack: 5,
    },
  },
  sword_flame: {
    id: 'sword_flame',
    name: 'Flame Sword',
    description: 'A sword imbued with fire.',
    width: 1,
    height: 2,
    rarity: 'rare',
    equipSlot: 'mainHand',
    icon: '/icons/flame_sword.png',
    stats: {
      attack: 15,
      critChance: 5,
    },
  },
  sword_legendary: {
    id: 'sword_legendary',
    name: 'Excalibur',
    description: 'The legendary sword of kings.',
    width: 1,
    height: 2,
    rarity: 'legendary',
    equipSlot: 'mainHand',
    icon: '/icons/excalibur.png',
    stats: {
      attack: 50,
      critChance: 15,
      critDamage: 50,
    },
  },
  staff_magic: {
    id: 'staff_magic',
    name: 'Magic Staff',
    description: 'A staff that enhances magical abilities.',
    width: 1,
    height: 2,
    rarity: 'uncommon',
    equipSlot: 'mainHand',
    icon: '/icons/staff.png',
    stats: {
      attack: 8,
      speed: 10,
    },
  },

  // 방어구류 - 머리
  helmet_iron: {
    id: 'helmet_iron',
    name: 'Iron Helm',
    description: 'Basic iron helmet.',
    width: 1,
    height: 1,
    rarity: 'common',
    equipSlot: 'head',
    icon: '/icons/helmet.png',
    stats: {
      defense: 3,
    },
  },
  helmet_gold: {
    id: 'helmet_gold',
    name: 'Gold Crown',
    description: 'A crown fit for royalty.',
    width: 1,
    height: 1,
    rarity: 'epic',
    equipSlot: 'head',
    icon: '/icons/crown.png',
    stats: {
      defense: 10,
      health: 50,
    },
  },

  // 방어구류 - 몸통
  armor_leather: {
    id: 'armor_leather',
    name: 'Leather',
    description: 'Light leather armor.',
    width: 1,
    height: 2,
    rarity: 'common',
    equipSlot: 'chest',
    icon: '/icons/armor.png',
    stats: {
      defense: 5,
      speed: 5,
    },
  },
  armor_plate: {
    id: 'armor_plate',
    name: 'Plate',
    description: 'Heavy plate armor.',
    width: 1,
    height: 2,
    rarity: 'rare',
    equipSlot: 'chest',
    icon: '/icons/plate.png',
    stats: {
      defense: 20,
      health: 30,
    },
  },

  // 방어구류 - 방패 (보조손)
  shield_wooden: {
    id: 'shield_wooden',
    name: 'Wood Shield',
    description: 'A simple wooden shield.',
    width: 1,
    height: 1,
    rarity: 'common',
    equipSlot: 'offHand',
    icon: '/icons/shield.png',
    stats: {
      defense: 5,
    },
  },
  shield_tower: {
    id: 'shield_tower',
    name: 'Tower Shield',
    description: 'A massive tower shield.',
    width: 1,
    height: 2,
    rarity: 'rare',
    equipSlot: 'offHand',
    icon: '/icons/tower_shield.png',
    stats: {
      defense: 25,
      health: 20,
    },
  },

  // 방어구류 - 장갑
  gloves_leather: {
    id: 'gloves_leather',
    name: 'Leather Gloves',
    description: 'Light leather gloves.',
    width: 1,
    height: 1,
    rarity: 'common',
    equipSlot: 'hands',
    icon: '/icons/gloves.png',
    stats: {
      attack: 2,
      defense: 1,
    },
  },

  // 방어구류 - 다리
  legs_chainmail: {
    id: 'legs_chainmail',
    name: 'Chainmail',
    description: 'Chainmail leg armor.',
    width: 1,
    height: 1,
    rarity: 'uncommon',
    equipSlot: 'legs',
    icon: '/icons/chainmail.png',
    stats: {
      defense: 8,
    },
  },

  // 방어구류 - 신발
  boots_speed: {
    id: 'boots_speed',
    name: 'Swift Boots',
    description: 'Boots that increase movement speed.',
    width: 1,
    height: 1,
    rarity: 'uncommon',
    equipSlot: 'feet',
    icon: '/icons/boots.png',
    stats: {
      speed: 20,
      defense: 2,
    },
  },

  // 악세서리 - 반지
  ring_health: {
    id: 'ring_health',
    name: 'HP Ring',
    description: 'Increases maximum health.',
    width: 1,
    height: 1,
    rarity: 'uncommon',
    equipSlot: 'ring',
    icon: '/icons/ring.png',
    stats: {
      health: 30,
    },
  },
  ring_power: {
    id: 'ring_power',
    name: 'Power Ring',
    description: 'Increases attack damage.',
    width: 1,
    height: 1,
    rarity: 'rare',
    equipSlot: 'ring',
    icon: '/icons/ring_power.png',
    stats: {
      attack: 10,
      critDamage: 15,
    },
  },

  // 악세서리 - 목걸이
  amulet_luck: {
    id: 'amulet_luck',
    name: 'Lucky Charm',
    description: 'Increases critical chance.',
    width: 1,
    height: 1,
    rarity: 'epic',
    equipSlot: 'amulet',
    icon: '/icons/amulet.png',
    stats: {
      critChance: 10,
      critDamage: 25,
    },
  },

  // 소모품
  potion_health: {
    id: 'potion_health',
    name: 'HP Potion',
    description: 'Restores 50 health.',
    width: 1,
    height: 1,
    maxStack: 20,
    rarity: 'common',
    icon: '/icons/potion_health.png',
  },
  potion_speed: {
    id: 'potion_speed',
    name: 'Speed Potion',
    description: 'Temporarily increases speed.',
    width: 1,
    height: 1,
    maxStack: 20,
    rarity: 'uncommon',
    icon: '/icons/potion_speed.png',
  },

  // 재료
  gold_coin: {
    id: 'gold_coin',
    name: 'Gold',
    description: 'Currency.',
    width: 1,
    height: 1,
    maxStack: 9999,
    rarity: 'common',
    icon: '/icons/gold.png',
  },
  gem_ruby: {
    id: 'gem_ruby',
    name: 'Ruby',
    description: 'A precious gem.',
    width: 1,
    height: 1,
    maxStack: 10,
    rarity: 'rare',
    icon: '/icons/ruby.png',
  },
  gem_diamond: {
    id: 'gem_diamond',
    name: 'Diamond',
    description: 'A flawless diamond.',
    width: 1,
    height: 1,
    maxStack: 10,
    rarity: 'legendary',
    icon: '/icons/diamond.png',
  },
};

/**
 * 레리티별 드랍 확률 가중치
 */
export const RARITY_WEIGHTS: Record<ItemRarity, number> = {
  common: 60,
  uncommon: 25,
  rare: 10,
  epic: 4,
  legendary: 1,
};

/**
 * 레리티별 아이템 목록 가져오기
 */
export function getItemsByRarity(rarity: ItemRarity): ItemConfig[] {
  return Object.values(ITEM_DATABASE).filter((item) => item.rarity === rarity);
}

/**
 * 랜덤 아이템 선택 (레리티 가중치 적용)
 */
export function getRandomItem(): ItemConfig {
  const totalWeight = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;

  for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS) as [ItemRarity, number][]) {
    random -= weight;
    if (random <= 0) {
      const items = getItemsByRarity(rarity);
      if (items.length > 0) {
        return items[Math.floor(Math.random() * items.length)];
      }
    }
  }

  // 폴백: common 아이템
  const commonItems = getItemsByRarity('common');
  return commonItems[Math.floor(Math.random() * commonItems.length)];
}

/**
 * 초기 지급 아이템 목록
 */
export function getStarterItems(): ItemConfig[] {
  return [
    ITEM_DATABASE.sword_basic,
    ITEM_DATABASE.armor_leather,
    ITEM_DATABASE.potion_health,
    ITEM_DATABASE.potion_health,
  ];
}
