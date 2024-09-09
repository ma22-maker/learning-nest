/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/user.service'; 

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService, 
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(req) => req?.cookies['accessToken']]),
      secretOrKey: process.env.JWT_SECRET, 
    });
  }

  async validate(payload: any) {
    console.log("inside access token strategy",payload)
    const user = await this.userService.findUserById(payload.userId);
    console.log("inside access token strategy",user)
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
