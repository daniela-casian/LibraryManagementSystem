
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { BooksService } from './books.service.js';
import { CreateBookDto } from './dto/create-book.dto.js';
import { UpdateBookDto } from './dto/update-book.dto.js';
import { FindBooksDto } from './dto/find-books.dto.js';
import { AdminGuard } from '../auth/admin.guard.js';

@Controller('books')
export class BooksController {
  constructor(
    private readonly booksService: BooksService,
  ) {}

  // Public: cititorii pot vedea cărțile
  @Get()
  findAll(@Query() query: FindBooksDto) {
    return this.booksService.findAll(query);
  }

  // Public: cititorii pot vedea detaliile unei cărți
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.findOne(id);
  }

  // Doar administratorul poate adăuga cărți
  @Post()
  @UseGuards(AdminGuard)
  create(@Body() dto: CreateBookDto) {
    return this.booksService.create(dto);
  }

  // Doar administratorul poate modifica cărți
  @Patch(':id')
  @UseGuards(AdminGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookDto,
  ) {
    return this.booksService.update(id, dto);
  }

  // Doar administratorul poate șterge cărți
  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.remove(id);
  }
}
