import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserAdminService {
  constructor(private prisma: PrismaService) {}

  async listUsersBasedOnRole(role: Role) {
    const users = await this.prisma.user.findMany({
      where: {
        role,
      },
    });

    return users;
  }

  async updatePermissions(id: string, role: Role) {
    const user = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        role,
      },
    });

    return user;
  }
}
