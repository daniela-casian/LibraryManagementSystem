
import {
  IsInt,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateBookDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @MinLength(1)
  author: string;

  @IsString()
  @MinLength(1)
  description: string;

  @IsInt()
  @Min(1)
  categoryId: number;

  @IsInt()
  @Min(0)
  @Max(2100)
  publicationYear: number;

  @IsString()
  @MinLength(1)
  isbn: string;
}
