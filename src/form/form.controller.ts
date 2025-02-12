import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { FormService } from './form.service';
import { CreateFormDto } from './dto/create-form.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AuthGuard } from '../auth/guards/jwt.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UpdateFormDto } from './dto/update-form.dto';

@Controller('listings')
export class FormController {
  constructor(private readonly formService: FormService) {}

  @UseGuards(AuthGuard)
  @Roles('BROKER')
  @Post()
  create(@Body() createFormDto: CreateFormDto, @GetUser('sub') userId: string) {
    return this.formService.create(createFormDto, userId);
  }

  @Get()
  findAll(@Body() findFormDto: any) {
    return this.formService.findAll(findFormDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Roles('BROKER')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFormDto: UpdateFormDto,
    @GetUser('sub') userId: string,
  ) {
    return this.formService.update(id, updateFormDto, userId);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser('sub') userId: string) {
    return this.formService.remove(id, userId);
  }
}
