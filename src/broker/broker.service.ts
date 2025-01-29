import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class BrokerService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return `This action returns all broker`;
  }

  async findOne(brokerId: string) {
    try {
      const brokerDetails = await this.prisma.user.findUniqueOrThrow({
        where: {
          id: brokerId,
          role: Role.BROKER,
        },
        select: {
          email: true,
          phoneNumber: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          name: true,
          createdAt: true,
        },
      });

      // Ensure the user has the BROKER role
      if (!brokerDetails) {
        throw new NotFoundException(`Broker with ID ${brokerId} not found`);
      }

      return brokerDetails;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle specific Prisma errors
        switch (error.code) {
          case 'P2025': // Record not found
            throw new NotFoundException(`Broker with ID ${brokerId} not found`);
          default:
            throw new InternalServerErrorException(
              `Database error occurred: ${error.message}`,
            );
        }
      } else if (error instanceof NotFoundException) {
        throw error; // Re-throw NotFoundException as is
      } else {
        // Handle unexpected errors
        throw new InternalServerErrorException(
          'An unexpected error occurred while fetching broker details',
        );
      }
    }
  }
}
