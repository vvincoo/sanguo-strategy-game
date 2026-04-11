export type ResourceKey = 'food' | 'wood' | 'iron' | 'stone' | 'gold' | 'gem';

export interface ResourcePreset {
  initialAmount: number;
  productionPerHour: number;
  baseCapacity: number;
}

export const RESOURCE_CONFIG: Record<ResourceKey, ResourcePreset> = {
  food: { initialAmount: 2000, productionPerHour: 600, baseCapacity: 20000 },
  wood: { initialAmount: 1500, productionPerHour: 450, baseCapacity: 16000 },
  iron: { initialAmount: 900, productionPerHour: 320, baseCapacity: 12000 },
  stone: { initialAmount: 900, productionPerHour: 280, baseCapacity: 12000 },
  gold: { initialAmount: 1000, productionPerHour: 200, baseCapacity: 8000 },
  gem: { initialAmount: 100, productionPerHour: 10, baseCapacity: 2000 }
};

export const RESOURCE_KEYS = Object.keys(RESOURCE_CONFIG) as ResourceKey[];
