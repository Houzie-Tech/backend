import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.profileService.remove(+id);
  }
}
