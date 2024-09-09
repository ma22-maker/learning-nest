import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

  // Find a user by ID
  async findUserById(id: number) {
    const user = await this.databaseService.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // Promote a user to the 'ADMIN' role
  async promoteToAdmin(id: number) {
    const user = await this.databaseService.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === Role.ADMIN) {
      throw new BadRequestException('User is already an admin');
    }

    return this.databaseService.user.update({
      where: { id },
      data: { role: Role.ADMIN },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });
  }
}
