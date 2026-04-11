import { IsEmail, IsEnum, IsString, Length, Matches } from 'class-validator';
import { Faction } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(8, 32)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'password must contain letters and numbers'
  })
  password!: string;

  @IsString()
  @Length(2, 16)
  nickname!: string;

  @IsEnum(Faction)
  faction!: Faction;
}
