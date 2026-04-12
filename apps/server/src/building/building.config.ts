import { BuildingType } from '../game-enums';

export interface UpgradeCost {
  food: number;
  wood: number;
  iron: number;
  stone: number;
  gold: number;
  gem: number;
}

export interface BuildingTemplate {
  type: BuildingType;
  name: string;
  maxLevel: number;
  baseUpgradeSeconds: number;
  baseCost: UpgradeCost;
  growth: number;
}

export const BUILDING_TEMPLATES: Record<BuildingType, BuildingTemplate> = {
  main_hall: {
    type: BuildingType.main_hall,
    name: '主城府',
    maxLevel: 20,
    baseUpgradeSeconds: 60,
    baseCost: { food: 300, wood: 300, iron: 150, stone: 150, gold: 200, gem: 0 },
    growth: 1.35
  },
  farm: {
    type: BuildingType.farm,
    name: '农田',
    maxLevel: 20,
    baseUpgradeSeconds: 45,
    baseCost: { food: 100, wood: 120, iron: 80, stone: 80, gold: 120, gem: 0 },
    growth: 1.3
  },
  lumber_mill: {
    type: BuildingType.lumber_mill,
    name: '伐木场',
    maxLevel: 20,
    baseUpgradeSeconds: 45,
    baseCost: { food: 120, wood: 100, iron: 80, stone: 80, gold: 120, gem: 0 },
    growth: 1.3
  },
  iron_mine: {
    type: BuildingType.iron_mine,
    name: '铁矿场',
    maxLevel: 20,
    baseUpgradeSeconds: 50,
    baseCost: { food: 130, wood: 110, iron: 90, stone: 90, gold: 130, gem: 0 },
    growth: 1.32
  },
  stone_quarry: {
    type: BuildingType.stone_quarry,
    name: '石料场',
    maxLevel: 20,
    baseUpgradeSeconds: 50,
    baseCost: { food: 130, wood: 110, iron: 90, stone: 90, gold: 130, gem: 0 },
    growth: 1.32
  },
  warehouse: {
    type: BuildingType.warehouse,
    name: '仓库',
    maxLevel: 20,
    baseUpgradeSeconds: 55,
    baseCost: { food: 100, wood: 150, iron: 100, stone: 140, gold: 160, gem: 0 },
    growth: 1.33
  },
  barracks: {
    type: BuildingType.barracks,
    name: '兵营',
    maxLevel: 20,
    baseUpgradeSeconds: 65,
    baseCost: { food: 150, wood: 130, iron: 120, stone: 110, gold: 180, gem: 0 },
    growth: 1.34
  },
  institute: {
    type: BuildingType.institute,
    name: '研究所',
    maxLevel: 20,
    baseUpgradeSeconds: 70,
    baseCost: { food: 140, wood: 140, iron: 130, stone: 120, gold: 220, gem: 0 },
    growth: 1.36
  }
};

export const INITIAL_BUILDING_TYPES = Object.values(BuildingType);

export function getUpgradeCost(type: BuildingType, nextLevel: number): UpgradeCost {
  const template = BUILDING_TEMPLATES[type];
  const factor = Math.pow(template.growth, Math.max(0, nextLevel - 1));

  return {
    food: Math.floor(template.baseCost.food * factor),
    wood: Math.floor(template.baseCost.wood * factor),
    iron: Math.floor(template.baseCost.iron * factor),
    stone: Math.floor(template.baseCost.stone * factor),
    gold: Math.floor(template.baseCost.gold * factor),
    gem: Math.floor(template.baseCost.gem * factor)
  };
}

export function getUpgradeSeconds(type: BuildingType, nextLevel: number): number {
  const template = BUILDING_TEMPLATES[type];
  return Math.floor(template.baseUpgradeSeconds * Math.pow(1.25, Math.max(0, nextLevel - 1)));
}
