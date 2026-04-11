import { Injectable, NotFoundException } from '@nestjs/common';
import { ResourceStock } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { RESOURCE_CONFIG, RESOURCE_KEYS, ResourceKey } from './resource.config';

@Injectable()
export class ResourceService {
  constructor(private readonly prisma: PrismaService) {}

  buildInitialResourceStock() {
    return {
      food: RESOURCE_CONFIG.food.initialAmount,
      wood: RESOURCE_CONFIG.wood.initialAmount,
      iron: RESOURCE_CONFIG.iron.initialAmount,
      stone: RESOURCE_CONFIG.stone.initialAmount,
      gold: RESOURCE_CONFIG.gold.initialAmount,
      gem: RESOURCE_CONFIG.gem.initialAmount,
      foodPerHour: RESOURCE_CONFIG.food.productionPerHour,
      woodPerHour: RESOURCE_CONFIG.wood.productionPerHour,
      ironPerHour: RESOURCE_CONFIG.iron.productionPerHour,
      stonePerHour: RESOURCE_CONFIG.stone.productionPerHour,
      goldPerHour: RESOURCE_CONFIG.gold.productionPerHour,
      gemPerHour: RESOURCE_CONFIG.gem.productionPerHour,
      foodCapacity: RESOURCE_CONFIG.food.baseCapacity,
      woodCapacity: RESOURCE_CONFIG.wood.baseCapacity,
      ironCapacity: RESOURCE_CONFIG.iron.baseCapacity,
      stoneCapacity: RESOURCE_CONFIG.stone.baseCapacity,
      goldCapacity: RESOURCE_CONFIG.gold.baseCapacity,
      gemCapacity: RESOURCE_CONFIG.gem.baseCapacity
    };
  }

  async settleByCityId(cityId: string) {
    const stock = await this.prisma.resourceStock.findUnique({ where: { cityId } });
    if (!stock) {
      throw new NotFoundException('resource stock not found');
    }

    const now = new Date();
    const elapsedSeconds = Math.max(
      0,
      Math.floor((now.getTime() - stock.lastCollectedAt.getTime()) / 1000)
    );

    if (elapsedSeconds === 0) {
      return stock;
    }

    const nextData: Partial<ResourceStock> & { lastCollectedAt: Date } = {
      lastCollectedAt: now
    };

    for (const key of RESOURCE_KEYS) {
      const perHour = stock[this.rateField(key)];
      const current = stock[key];
      const capacity = stock[this.capacityField(key)];
      const generated = Math.floor((perHour * elapsedSeconds) / 3600);
      nextData[key] = Math.min(current + generated, capacity);
    }

    return this.prisma.resourceStock.update({
      where: { cityId },
      data: nextData
    });
  }

  async settleByUserId(userId: string) {
    const city = await this.prisma.city.findUnique({ where: { userId } });
    if (!city) {
      throw new NotFoundException('city not found');
    }

    return this.settleByCityId(city.id);
  }

  private rateField(key: ResourceKey): keyof ResourceStock {
    return `${key}PerHour` as keyof ResourceStock;
  }

  private capacityField(key: ResourceKey): keyof ResourceStock {
    return `${key}Capacity` as keyof ResourceStock;
  }
}
