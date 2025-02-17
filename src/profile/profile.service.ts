import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async findOne(userId: string) {
    try {
      const profile = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          phoneNumber: true,
          role: true,
          aadharNumber: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return profile;
    } catch (error) {
      throw new NotFoundException('Profile not found');
    }
  }

  async update(userId: string, updateProfileDto: UpdateProfileDto) {
    try {
      const { name, aadharNumber } = updateProfileDto;
      const profile = await this.prisma.user.update({
        where: { id: userId },
        data: { name, aadharNumber },
      });
      return profile;
    } catch (error) {
      throw new NotFoundException('Profile not found');
    }
  }

  remove(id: number) {
    return `This action removes a #${id} profile`;
  }
}
