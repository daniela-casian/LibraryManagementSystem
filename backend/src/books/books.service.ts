
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookEntity } from './book.entity.js';
import { CreateBookDto } from './dto/create-book.dto.js';
import { UpdateBookDto } from './dto/update-book.dto.js';
import { FindBooksDto } from './dto/find-books.dto.js';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(BookEntity)
    private readonly booksRepository: Repository<BookEntity>,
  ) {}

  async findAll(query: FindBooksDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const qb = this.booksRepository.createQueryBuilder('book');

    if (query.search?.trim()) {
      qb.andWhere(
        '(LOWER(book.title) LIKE :search OR LOWER(book.author) LIKE :search)',
        { search: `%${query.search.trim().toLowerCase()}%` },
      );
    }

    if (query.year !== undefined) {
      qb.andWhere('book.publicationYear = :year', {
        year: query.year,
      });
    }

    qb.orderBy('book.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [books, total] = await qb.getManyAndCount();

    return {
      data: books,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<BookEntity> {
    const book = await this.booksRepository.findOneBy({ id });

    if (!book) {
      throw new NotFoundException(
        `Cartea cu ID-ul ${id} nu a fost găsită.`,
      );
    }

    return book;
  }

  async create(dto: CreateBookDto): Promise<BookEntity> {
    const categoryExists = await this.booksRepository.query(
      'SELECT id FROM categories WHERE id = $1',
      [dto.categoryId],
    );

    if (categoryExists.length === 0) {
      throw new BadRequestException(
        `Categoria cu ID-ul ${dto.categoryId} nu există.`,
      );
    }

    const existingBook = await this.booksRepository.findOneBy({
      isbn: dto.isbn.trim(),
    });

    if (existingBook) {
      throw new ConflictException(
        'Există deja o carte cu acest ISBN.',
      );
    }

    const book = this.booksRepository.create({
      title: dto.title.trim(),
      author: dto.author.trim(),
      description: dto.description.trim(),
      categoryId: dto.categoryId,
      publicationYear: dto.publicationYear,
      isbn: dto.isbn.trim(),
    });

    return this.booksRepository.save(book);
  }

  async update(
    id: number,
    dto: UpdateBookDto,
  ): Promise<BookEntity> {
    const book = await this.findOne(id);

    if (dto.categoryId !== undefined) {
      const categoryExists = await this.booksRepository.query(
        'SELECT id FROM categories WHERE id = $1',
        [dto.categoryId],
      );

      if (categoryExists.length === 0) {
        throw new BadRequestException(
          `Categoria cu ID-ul ${dto.categoryId} nu există.`,
        );
      }
    }

    if (dto.isbn !== undefined) {
      const existingBook = await this.booksRepository.findOneBy({
        isbn: dto.isbn.trim(),
      });

      if (existingBook && existingBook.id !== id) {
        throw new ConflictException(
          'Există deja o carte cu acest ISBN.',
        );
      }
    }

    if (dto.title !== undefined) {
      book.title = dto.title.trim();
    }

    if (dto.author !== undefined) {
      book.author = dto.author.trim();
    }

    if (dto.description !== undefined) {
      book.description = dto.description.trim();
    }

    if (dto.categoryId !== undefined) {
      book.categoryId = dto.categoryId;
    }

    if (dto.publicationYear !== undefined) {
      book.publicationYear = dto.publicationYear;
    }

    if (dto.isbn !== undefined) {
      book.isbn = dto.isbn.trim();
    }

    return this.booksRepository.save(book);
  }

  async remove(id: number): Promise<{ message: string }> {
    const book = await this.findOne(id);

    await this.booksRepository.remove(book);

    return {
      message: `Cartea cu ID-ul ${id} a fost ștearsă.`,
    };
  }
}
