import { Controller, Get, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':id')
  findOne(@Param('id') userId: string) {
    return this.profileService.findOne(userId);
  }

  @Patch(':id')
  update(
    @Param('id') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profileService.update(userId, updateProfileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.profileService.remove(+id);
  }
}
