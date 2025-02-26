import {
  Controller,
  Get,
  UseGuards,
  Param,
  BadRequestException,
  Body,
  Put,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from 'src/auth/guards/jwt.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { BrokerAdminService } from './admin.broker.service';
import { ListingAdminService } from './admin.listing.service';
import { BrokerScore } from './admin.broker.service';
import { Role } from '@prisma/client';
import { UserAdminService } from './admin.user.service';

@UseGuards(AuthGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly listingAdminService: ListingAdminService,
    private readonly userAdminService: UserAdminService,
    private readonly brokerAdminService: BrokerAdminService,
  ) {}

  @Roles('ADMIN')
  // Dashboard Overview
  @Get(`metrics`)
  async getDashboardMetrics() {
    const [listings, users, leads, activities, quickActions] =
      await Promise.all([
        this.adminService.getListingStatusBreakdown(),
        this.adminService.getUserRegistrationStats(),
        this.adminService.getLeadConversionMetrics(),
        this.adminService.getRecentActivities(),
        this.adminService.getQuickActionStats(),
      ]);

    return {
      listings,
      users,
      leads,
      activities,
      quickActions,
    };
  }

  @Roles('ADMIN')
  @Get(`brokers/gettopbrokers`)
  async getTopBrokers() {
    return await this.brokerAdminService.getTopBrokers();
  }

  @Roles('ADMIN')
  @Get(`brokers/:brokerId/score`)
  async getBrokerScore(
    @Param('brokerId') brokerId: string,
  ): Promise<BrokerScore> {
    const brokerScore =
      await this.brokerAdminService.calculateBrokerScore(brokerId);
    return brokerScore;
  }

  @Roles('ADMIN')
  @Get(`users/:role`)
  async getAllUsers(@Param('role') role: Role) {
    if (Object.values(Role).includes(role)) {
      return await this.userAdminService.listUsersBasedOnRole(role);
    }
    throw new BadRequestException(`Invalid role ${role}`);
  }

  @Roles('ADMIN')
  @Put('users/updatepermission/:id')
  async updatePermission(
    @Param('id') id: string,
    @Body()
    body: {
      role: Role;
    },
  ) {
    if (!Object.values(Role).includes(body.role)) {
      throw new BadRequestException(`Invalid role: ${body.role}`);
    }

    return await this.userAdminService.updatePermissions(id, body.role);
  }
}
