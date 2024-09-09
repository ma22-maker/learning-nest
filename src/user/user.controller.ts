// src/user/user.controller.ts
import { Controller, Get, Param, Put } from '@nestjs/common';
// import { JwtAuthGuard } from '../auth/guards/JWT-guard';
// import { Roles } from '../auth/roles.decorator';
// import { RolesGuard } from '../auth/guards/Role.guard';
// import { Role } from '@prisma/client';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  // Route: Get user by ID (accessible by both roles)
  // @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userService.findUserById(+id);
  }

  // Route: Promote user to admin (accessible only to admin)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN)
  @Put('promote/:id')
  async promoteUserToAdmin(@Param('id') id: string) {
    return this.userService.promoteToAdmin(+id);
  }
}
