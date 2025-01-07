import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseFloatPipe,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { FormService } from './form.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AuthGuard } from '../auth/guards/jwt.guard';

@UseGuards(AuthGuard)
@Controller('listings')
export class FormController {
  constructor(private readonly formService: FormService) {}

  @Post()
  create(@Body() createFormDto: CreateFormDto, @GetUser('sub') userId: string) {
    return this.formService.create(createFormDto, userId);
  }

  @Get()
  findAll(
    @Query('skip', new ParseIntPipe({ optional: true })) skip?: number,
    @Query('take', new ParseIntPipe({ optional: true })) take?: number,
    @Query('status') status?: string,
    @Query('minPrice', new ParseFloatPipe({ optional: true }))
    minPrice?: number,
    @Query('maxPrice', new ParseFloatPipe({ optional: true }))
    maxPrice?: number,
  ) {
    return this.formService.findAll(skip, take, status, minPrice, maxPrice);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFormDto: UpdateFormDto,
    @GetUser('id') userId: string,
  ) {
    return this.formService.update(id, updateFormDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.formService.remove(id, userId);
  }
}
