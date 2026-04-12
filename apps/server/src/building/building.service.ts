import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BuildingType, QueueStatus } from '../game-enums';
import { PrismaService } from '../prisma.service';
import { RESOURCE_CONFIG } from '../resource/resource.config';
import {
  BUILDING_TEMPLATES,
  getUpgradeCost,
  getUpgradeSeconds,
  INITIAL_BUILDING_TYPES,
  UpgradeCost
} from './building.config';

@Injectable()
export class BuildingService {
  constructor(private readonly prisma: PrismaService) {}

  async initializeCityBuildings(tx: Prisma.TransactionClient, cityId: string) {
    const rows = INITIAL_BUILDING_TYPES.map((type) => ({ cityId, type, level: 1 }));
    await tx.building.createMany({ data: rows });
  }

  async listBuildings(userId: string) {
    await this.settleQueuesByUserId(userId);
    const city = await this.findCity(userId);
    const buildings = await this.prisma.building.findMany({
      where: { cityId: city.id },
      orderBy: { type: 'asc' }
    });

    return buildings.map((building: any) => {
      const typedType = building.type as BuildingType;
      const nextLevel = Number(building.level) + 1;
      const template = BUILDING_TEMPLATES[typedType];
      return {
        id: building.id,
        type: building.type,
        name: template.name,
        level: building.level,
        isUpgrading: building.isUpgrading,
        maxLevel: template.maxLevel,
        nextUpgrade: nextLevel > template.maxLevel
          ? null
          : {
              toLevel: nextLevel,
              durationSeconds: getUpgradeSeconds(typedType, nextLevel),
              cost: getUpgradeCost(typedType, nextLevel)
            }
      };
    });
  }

  async listQueues(userId: string) {
    await this.settleQueuesByUserId(userId);
    const city = await this.findCity(userId);
    const queues = await this.prisma.buildingQueue.findMany({
      where: { cityId: city.id },
      orderBy: { createdAt: 'desc' },
      include: { building: true }
    });

    return queues.map((queue: any) => ({
      id: queue.id,
      buildingType: queue.building.type,
      status: queue.status,
      fromLevel: queue.fromLevel,
      toLevel: queue.toLevel,
      startAt: queue.startAt,
      finishAt: queue.finishAt,
      remainingSeconds:
        queue.status === QueueStatus.pending
          ? Math.max(0, Math.floor((queue.finishAt.getTime() - Date.now()) / 1000))
          : 0
    }));
  }

  async startUpgrade(userId: string, type: BuildingType) {
    await this.settleQueuesByUserId(userId);
    const city = await this.findCity(userId);

    if (!BUILDING_TEMPLATES[type]) {
      throw new BadRequestException('invalid building type');
    }

    const [building, resourceStock, activeQueueCount] = await Promise.all([
      this.prisma.building.findUnique({ where: { cityId_type: { cityId: city.id, type } } }),
      this.prisma.resourceStock.findUnique({ where: { cityId: city.id } }),
      this.prisma.buildingQueue.count({ where: { cityId: city.id, status: QueueStatus.pending } })
    ]);

    if (!building || !resourceStock) {
      throw new NotFoundException('building or resources not found');
    }

    if (building.isUpgrading) {
      throw new BadRequestException('building is already upgrading');
    }

    if (activeQueueCount >= city.queueSlots) {
      throw new BadRequestException('upgrade queue is full');
    }

    const nextLevel = building.level + 1;
    const template = BUILDING_TEMPLATES[type];
    if (nextLevel > template.maxLevel) {
      throw new BadRequestException('building has reached max level');
    }

    const cost = getUpgradeCost(type, nextLevel);
    this.ensureResourceEnough(resourceStock, cost);

    const now = new Date();
    const durationSeconds = getUpgradeSeconds(type, nextLevel);
    const finishAt = new Date(now.getTime() + durationSeconds * 1000);

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.resourceStock.update({
        where: { cityId: city.id },
        data: {
          food: { decrement: cost.food },
          wood: { decrement: cost.wood },
          iron: { decrement: cost.iron },
          stone: { decrement: cost.stone },
          gold: { decrement: cost.gold },
          gem: { decrement: cost.gem }
        }
      });

      await tx.building.update({
        where: { id: building.id },
        data: { isUpgrading: true }
      });

      await tx.buildingQueue.create({
        data: {
          cityId: city.id,
          buildingId: building.id,
          fromLevel: building.level,
          toLevel: nextLevel,
          startAt: now,
          finishAt,
          status: QueueStatus.pending
        }
      });
    });

    return {
      buildingType: type,
      fromLevel: building.level,
      toLevel: nextLevel,
      finishAt,
      cost
    };
  }

  async settleQueuesByUserId(userId: string) {
    const city = await this.findCity(userId);
    return this.settleQueuesByCityId(city.id);
  }

  async settleQueuesByCityId(cityId: string) {
    const now = new Date();
    const completedQueues = await this.prisma.buildingQueue.findMany({
      where: {
        cityId,
        status: QueueStatus.pending,
        finishAt: { lte: now }
      },
      include: { building: true }
    });

    if (completedQueues.length === 0) {
      return { completed: 0 };
    }

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      for (const queue of completedQueues) {
        await tx.buildingQueue.update({
          where: { id: queue.id },
          data: { status: QueueStatus.completed }
        });

        await tx.building.update({
          where: { id: queue.buildingId },
          data: {
            level: queue.toLevel,
            isUpgrading: false,
            upgradedAt: now
          }
        });
      }

      await this.applyBuildingEffects(tx, cityId);
    });

    return { completed: completedQueues.length };
  }

  private async applyBuildingEffects(tx: Prisma.TransactionClient, cityId: string) {
    const [buildings, stock] = await Promise.all([
      tx.building.findMany({ where: { cityId } }),
      tx.resourceStock.findUnique({ where: { cityId } })
    ]);

    if (!stock) {
      throw new NotFoundException('resource stock not found');
    }

    const levelMap = new Map(
      buildings.map((item: any) => [item.type as BuildingType, Number(item.level)] as const)
    );
    const farmLevel = Number(levelMap.get(BuildingType.farm) ?? 1);
    const lumberLevel = Number(levelMap.get(BuildingType.lumber_mill) ?? 1);
    const ironLevel = Number(levelMap.get(BuildingType.iron_mine) ?? 1);
    const stoneLevel = Number(levelMap.get(BuildingType.stone_quarry) ?? 1);
    const warehouseLevel = Number(levelMap.get(BuildingType.warehouse) ?? 1);

    const capacityMultiplier = 1 + (warehouseLevel - 1) * 0.15;

    const foodPerHour = RESOURCE_CONFIG.food.productionPerHour + (farmLevel - 1) * 180;
    const woodPerHour = RESOURCE_CONFIG.wood.productionPerHour + (lumberLevel - 1) * 150;
    const ironPerHour = RESOURCE_CONFIG.iron.productionPerHour + (ironLevel - 1) * 120;
    const stonePerHour = RESOURCE_CONFIG.stone.productionPerHour + (stoneLevel - 1) * 120;

    await tx.city.update({
      where: { id: cityId },
      data: {
        level: levelMap.get(BuildingType.main_hall) ?? 1,
        warehouseLevel
      }
    });

    await tx.resourceStock.update({
      where: { cityId },
      data: {
        foodPerHour,
        woodPerHour,
        ironPerHour,
        stonePerHour,
        goldPerHour: RESOURCE_CONFIG.gold.productionPerHour,
        gemPerHour: RESOURCE_CONFIG.gem.productionPerHour,
        foodCapacity: Math.floor(RESOURCE_CONFIG.food.baseCapacity * capacityMultiplier),
        woodCapacity: Math.floor(RESOURCE_CONFIG.wood.baseCapacity * capacityMultiplier),
        ironCapacity: Math.floor(RESOURCE_CONFIG.iron.baseCapacity * capacityMultiplier),
        stoneCapacity: Math.floor(RESOURCE_CONFIG.stone.baseCapacity * capacityMultiplier),
        goldCapacity: Math.floor(RESOURCE_CONFIG.gold.baseCapacity * capacityMultiplier),
        gemCapacity: Math.floor(RESOURCE_CONFIG.gem.baseCapacity * capacityMultiplier),
        food: Math.min(stock.food, Math.floor(RESOURCE_CONFIG.food.baseCapacity * capacityMultiplier)),
        wood: Math.min(stock.wood, Math.floor(RESOURCE_CONFIG.wood.baseCapacity * capacityMultiplier)),
        iron: Math.min(stock.iron, Math.floor(RESOURCE_CONFIG.iron.baseCapacity * capacityMultiplier)),
        stone: Math.min(stock.stone, Math.floor(RESOURCE_CONFIG.stone.baseCapacity * capacityMultiplier)),
        gold: Math.min(stock.gold, Math.floor(RESOURCE_CONFIG.gold.baseCapacity * capacityMultiplier)),
        gem: Math.min(stock.gem, Math.floor(RESOURCE_CONFIG.gem.baseCapacity * capacityMultiplier))
      }
    });
  }

  private async findCity(userId: string) {
    const city = await this.prisma.city.findUnique({ where: { userId } });
    if (!city) {
      throw new NotFoundException('city not found');
    }
    return city;
  }

  private ensureResourceEnough(
    stock: {
      food: number;
      wood: number;
      iron: number;
      stone: number;
      gold: number;
      gem: number;
    },
    cost: UpgradeCost
  ) {
    if (
      stock.food < cost.food ||
      stock.wood < cost.wood ||
      stock.iron < cost.iron ||
      stock.stone < cost.stone ||
      stock.gold < cost.gold ||
      stock.gem < cost.gem
    ) {
      throw new BadRequestException('insufficient resources');
    }
  }
}
