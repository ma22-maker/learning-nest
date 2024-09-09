/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly saltRounds = 10;
  private readonly refreshTokenExpiry = '7d';
  private readonly accessTokenExpiry = '1h';

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  private async findUserByEmail(email: string) {
    return this.databaseService.user.findUnique({
      where: { email },
    });
  }
  
//generate tokens
  private generateTokens(userId: number, role: string) {
    const accessToken = this.jwtService.sign(
      { userId: userId.toString(), role },
      { expiresIn: this.accessTokenExpiry },
    );
    const refreshToken = this.jwtService.sign(
      { userId: userId.toString(),role },
      { expiresIn: this.refreshTokenExpiry },
    );
    return { accessToken, refreshToken };
  }

  private async hashPassword(password: string) {
    return bcrypt.hash(password, this.saltRounds);
  }

  private async comparePassword(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword);
  }

  //login
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.findUserByEmail(email);
    if (!user || !(await this.comparePassword(password, user.password))) {
      throw new BadRequestException('Invalid credentials');
    }

    return this.generateTokens(user.id, user.role);
  }

  //register
  async register(registerDto: RegisterDto) {
    const { email, password, role } = registerDto;

    const existingUser = await this.findUserByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await this.hashPassword(password);

    const newUser = await this.databaseService.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || 'COMMON',
      },
    });

    return this.generateTokens(newUser.id, newUser.role);
  }

  //refreshtoken
  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const { userId, role } = payload;
      return this.generateTokens(userId, role);
    } catch {
      throw new BadRequestException('Invalid refresh token');
    }
  }
}
