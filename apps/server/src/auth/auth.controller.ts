import { Body, Controller, Post } from '@nestjs/common';
import { ResponseMessage } from '../common/response-message.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ResponseMessage('Register success')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ResponseMessage('Login success')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
