import {
  BadRequestException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { Faction } from '../game-enums';
import * as bcrypt from 'bcryptjs';
import { INITIAL_BUILDING_TYPES } from '../building/building.config';
import { PrismaService } from '../prisma.service';
import { ResourceService } from '../resource/resource.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly resourceService: ResourceService
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException('email already exists');
    }

    const nicknameTaken = await this.prisma.playerProfile.findUnique({
      where: { nickname: dto.nickname }
    });
    if (nicknameTaken) {
      throw new BadRequestException('nickname already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const resourceStock = this.resourceService.buildInitialResourceStock();

    const user = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const createdUser = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          playerProfile: {
            create: {
              nickname: dto.nickname,
              faction: dto.faction
            }
          }
        }
      });

      const city = await tx.city.create({
        data: {
          userId: createdUser.id,
          name: `${dto.nickname}的主城`
        }
      });

      await tx.resourceStock.create({
        data: {
          cityId: city.id,
          ...resourceStock
        }
      });

      await tx.building.createMany({
        data: INITIAL_BUILDING_TYPES.map((type) => ({ cityId: city.id, type, level: 1 }))
      });

      return tx.user.findUniqueOrThrow({
        where: { id: createdUser.id },
        include: { playerProfile: true }
      });
    });

    return this.buildAuthResponse(user.id, user.email, user.playerProfile?.nickname ?? dto.nickname);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { playerProfile: true }
    });

    if (!user) {
      throw new UnauthorizedException('invalid credentials');
    }

    const matched = await bcrypt.compare(dto.password, user.passwordHash);
    if (!matched) {
      throw new UnauthorizedException('invalid credentials');
    }

    return this.buildAuthResponse(
      user.id,
      user.email,
      user.playerProfile?.nickname ?? 'Unknown'
    );
  }

  private buildAuthResponse(userId: string, email: string, nickname: string) {
    const payload: JwtPayload = {
      sub: userId,
      email
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      tokenType: 'Bearer',
      user: {
        id: userId,
        email,
        nickname
      }
    };
  }
}
