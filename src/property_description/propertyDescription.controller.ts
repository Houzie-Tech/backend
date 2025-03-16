import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { DescriptionGeneratorService } from './propertyDescription.service';
import { AuthGuard } from 'src/auth/guards/jwt.guard';
import { User } from 'src/auth/decorators/auth.decorator';

@Controller('descriptions')
export class DescriptionController {
  constructor(private descriptionGenerator: DescriptionGeneratorService) {}

  @UseGuards(AuthGuard)
  @Get(':listingId')
  async getPersonalizedDescription(
    @User() user,
    @Param('listingId') listingId: string,
  ) {
    const description =
      await this.descriptionGenerator.generatePersonalizedDescription(
        user.id,
        listingId,
      );

    return { description };
  }
}
