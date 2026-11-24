
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('books')
export class BookEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  author: string | null;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'category_id', type: 'integer' })
  categoryId: number;

  @Column({ name: 'publication_year', type: 'integer' })
  publicationYear: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  isbn: string;
}
