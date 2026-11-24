
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksModule } from './books/books.module.js';
import { AuthModule } from './auth/auth.module.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '127.0.0.1',
      port: 5432,
      username: 'postgres',
      password: process.env.DB_PASSWORD,
      database: 'library',
      autoLoadEntities: true,
      synchronize: false,
    }),
    BooksModule,
    AuthModule,
  ],
})
export class AppModule {}
