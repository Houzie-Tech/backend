import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ListingAdminService } from './admin.listing.service';
import { BrokerAdminService } from './admin.broker.service';
import { UserAdminService } from './admin.user.service';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController],
  providers: [
    AdminService,
    ListingAdminService,
    BrokerAdminService,
    UserAdminService,
  ],
})
export class AdminModule {}
