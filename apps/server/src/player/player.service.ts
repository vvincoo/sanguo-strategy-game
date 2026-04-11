import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PlayerService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentPlayer(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { playerProfile: true, city: true }
    });

    if (!user || !user.playerProfile) {
      throw new NotFoundException('player profile not found');
    }

    return {
      user: {
        id: user.id,
        email: user.email
      },
      profile: {
        id: user.playerProfile.id,
        nickname: user.playerProfile.nickname,
        faction: user.playerProfile.faction,
        level: user.playerProfile.level,
        power: user.playerProfile.power
      },
      city: user.city
        ? {
            id: user.city.id,
            name: user.city.name,
            level: user.city.level,
            warehouseLevel: user.city.warehouseLevel
          }
        : null
    };
  }
}
