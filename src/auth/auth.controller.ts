/* eslint-disable prettier/prettier */
import { Controller, Post, Body, Res, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { RefreshJwtGuard } from './guards/refresh-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.login(loginDto);

    res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: 60 * 60 * 1000 }); // 60  minutes
    res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days

    return { message: 'Login successful' };
  }

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.register(registerDto);

    res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: 60 * 60 * 1000 }); // 60 minutes
    res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days

    return { message: 'Registration successful' };
  }

  @Post('refresh')
  @UseGuards(RefreshJwtGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async refresh(@Body() refreshTokenDto: RefreshTokenDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.refresh(refreshTokenDto.refreshToken);
    
    res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: 60 * 60 * 1000 }); // 1 hour
    res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days
  
    return { message: 'Token refreshed successfully' };
  
  }
}
