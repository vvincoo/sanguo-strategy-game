import { Injectable, NotFoundException } from '@nestjs/common';
import { BuildingService } from '../building/building.service';
import { PrismaService } from '../prisma.service';
import { ResourceService } from '../resource/resource.service';

@Injectable()
export class CityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly resourceService: ResourceService,
    private readonly buildingService: BuildingService
  ) {}

  async getMyCity(userId: string) {
    await this.buildingService.settleQueuesByUserId(userId);

    const city = await this.prisma.city.findUnique({
      where: { userId },
      include: { user: { include: { playerProfile: true } } }
    });

    if (!city) {
      throw new NotFoundException('city not found');
    }

    return {
      id: city.id,
      name: city.name,
      level: city.level,
      warehouseLevel: city.warehouseLevel,
      queueSlots: city.queueSlots,
      owner: {
        userId: city.userId,
        nickname: city.user.playerProfile?.nickname ?? 'Unknown'
      }
    };
  }

  async getMyResources(userId: string) {
    await this.buildingService.settleQueuesByUserId(userId);
    const stock = await this.resourceService.settleByUserId(userId);

    return {
      lastCollectedAt: stock.lastCollectedAt,
      current: {
        food: stock.food,
        wood: stock.wood,
        iron: stock.iron,
        stone: stock.stone,
        gold: stock.gold,
        gem: stock.gem
      },
      perHour: {
        food: stock.foodPerHour,
        wood: stock.woodPerHour,
        iron: stock.ironPerHour,
        stone: stock.stonePerHour,
        gold: stock.goldPerHour,
        gem: stock.gemPerHour
      },
      capacity: {
        food: stock.foodCapacity,
        wood: stock.woodCapacity,
        iron: stock.ironCapacity,
        stone: stock.stoneCapacity,
        gold: stock.goldCapacity,
        gem: stock.gemCapacity
      }
    };
  }
}
