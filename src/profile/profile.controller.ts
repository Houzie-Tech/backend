import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Post,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthGuard } from 'src/auth/guards/jwt.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @UseGuards(AuthGuard)
  @Get('')
  findOne(@GetUser('sub') userId: string) {
    return this.profileService.findOne(userId);
  }

  @UseGuards(AuthGuard)
  @Patch('')
  update(
    @GetUser('sub') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profileService.update(userId, updateProfileDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.profileService.remove(+id);
  }

  // Favorite listings endpoints
  @UseGuards(AuthGuard)
  @Post('favorites/:listingId')
  addToFavorites(
    @GetUser('sub') userId: string,
    @Param('listingId') listingId: string,
  ) {
    return this.profileService.addToFavorites(userId, listingId);
  }

  @UseGuards(AuthGuard)
  @Delete('favorites/:listingId')
  removeFromFavorites(
    @GetUser('sub') userId: string,
    @Param('listingId') listingId: string,
  ) {
    return this.profileService.removeFromFavorites(userId, listingId);
  }

  @UseGuards(AuthGuard)
  @Get('favorites')
  getFavoriteListings(@GetUser('sub') userId: string) {
    return this.profileService.getFavoriteListings(userId);
  }

  // Visited listings endpoints
  @UseGuards(AuthGuard)
  @Post('visited/:listingId')
  markListingAsVisited(
    @GetUser('sub') userId: string,
    @Param('listingId') listingId: string,
  ) {
    return this.profileService.markListingAsVisited(userId, listingId);
  }

  @UseGuards(AuthGuard)
  @Get('visited')
  getVisitedListings(@GetUser('sub') userId: string) {
    return this.profileService.getVisitedListings(userId);
  }
}
