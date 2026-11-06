
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { CreateBookDto } from './dto/create-book.dto.js';
import { UpdateBookDto } from './dto/update-book.dto.js';
import { FindBooksDto } from './dto/find-books.dto.js';

export type Book = {
  id: number;
  title: string;
  author: string;
  publicationYear: number;
};

@Injectable()
export class BooksService {
  private readonly dataDirectory = join(process.cwd(), 'data');
  private readonly filePath = join(this.dataDirectory, 'books.json');

  private async readBooks(): Promise<Book[]> {
    await mkdir(this.dataDirectory, { recursive: true });

    try {
      const content = await readFile(this.filePath, 'utf8');
      const books: unknown = JSON.parse(content);

      if (!Array.isArray(books)) {
        throw new BadRequestException(
          'Fișierul books.json trebuie să conțină o listă de cărți.',
        );
      }

      return books as Book[];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        const initialBooks: Book[] = [
          {
            id: 1,
            title: 'Harry Potter',
            author: 'J. K. Rowling',
            publicationYear: 1997,
          },
          {
            id: 2,
            title: 'The Hobbit',
            author: 'J. R. R. Tolkien',
            publicationYear: 1937,
          },
        ];

        await this.writeBooks(initialBooks);
        return initialBooks;
      }

      throw error;
    }
  }

  private async writeBooks(books: Book[]): Promise<void> {
    await mkdir(this.dataDirectory, { recursive: true });
    await writeFile(
      this.filePath,
      JSON.stringify(books, null, 2),
      'utf8',
    );
  }

  async findAll(query: FindBooksDto) {
    let filteredBooks = await this.readBooks();

    if (query.search?.trim()) {
      const term = query.search.trim().toLowerCase();

      filteredBooks = filteredBooks.filter(
        (book) =>
          book.title.toLowerCase().includes(term) ||
          book.author.toLowerCase().includes(term),
      );
    }

    if (query.year !== undefined) {
      filteredBooks = filteredBooks.filter(
        (book) => book.publicationYear === query.year,
      );
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const total = filteredBooks.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;

    return {
      data: filteredBooks.slice(startIndex, startIndex + limit),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: number): Promise<Book> {
    const books = await this.readBooks();
    const book = books.find((item) => item.id === id);

    if (!book) {
      throw new NotFoundException(
        `Cartea cu ID-ul ${id} nu a fost găsită.`,
      );
    }

    return book;
  }

  async create(dto: CreateBookDto): Promise<Book> {
    const books = await this.readBooks();

    const newBook: Book = {
      id: Math.max(0, ...books.map((book) => book.id)) + 1,
      title: dto.title.trim(),
      author: dto.author.trim(),
      publicationYear: dto.publicationYear,
    };

    books.push(newBook);
    await this.writeBooks(books);

    return newBook;
  }

  async update(id: number, dto: UpdateBookDto): Promise<Book> {
    const books = await this.readBooks();
    const index = books.findIndex((book) => book.id === id);

    if (index === -1) {
      throw new NotFoundException(
        `Cartea cu ID-ul ${id} nu a fost găsită.`,
      );
    }

    const currentBook = books[index];

    const updatedBook: Book = {
      ...currentBook,
      ...(dto.title !== undefined && { title: dto.title.trim() }),
      ...(dto.author !== undefined && { author: dto.author.trim() }),
      ...(dto.publicationYear !== undefined && {
        publicationYear: dto.publicationYear,
      }),
    };

    books[index] = updatedBook;
    await this.writeBooks(books);

    return updatedBook;
  }

  async remove(id: number): Promise<{ message: string }> {
    const books = await this.readBooks();
    const index = books.findIndex((book) => book.id === id);

    if (index === -1) {
      throw new NotFoundException(
        `Cartea cu ID-ul ${id} nu a fost găsită.`,
      );
    }

    books.splice(index, 1);
    await this.writeBooks(books);

    return { message: `Cartea cu ID-ul ${id} a fost ștearsă.` };
  }
}
