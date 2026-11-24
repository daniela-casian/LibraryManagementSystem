
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module.js';
import { AdminGuard } from '../auth/admin.guard.js';

import { BooksController } from './books.controller.js';
import { BooksService } from './books.service.js';
import { BookEntity } from './book.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([BookEntity]),
    AuthModule,
  ],
  controllers: [BooksController],
  providers: [BooksService, AdminGuard],
})
export class BooksModule {}
