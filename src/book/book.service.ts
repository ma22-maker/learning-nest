/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, Book } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { parse, isValid } from 'date-fns';

@Injectable()
export class BookService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createBookDto: Prisma.BookCreateInput): Promise<Book> {
    const { publishedDate, ...bookData } = createBookDto;

    let parsedDate: Date;
    if (typeof publishedDate === 'string') {
      parsedDate = parse(publishedDate, 'MM/dd/yyyy', new Date());
    } else {
      parsedDate = publishedDate;
    }

    if (!isValid(parsedDate)) {
      throw new BadRequestException('Invalid date format. Please use MM/dd/yyyy.');
    }

    return this.databaseService.book.create({
      data: {
        ...bookData,
        publishedDate: parsedDate,
      },
    });
  }

  async findAll(query: { id?: string; author?: string; publishedDate?: string; q?: string; }): Promise<Book[]> {
    const { id, author, publishedDate, q } = query;

    const where: Prisma.BookWhereInput = {};

    if (id) {
      where.id = parseInt(id, 10);
    }
    if (author) {
      where.author = { contains: author, mode: 'insensitive' };
    }
    if (publishedDate) {
      const parsedDate = parse(publishedDate, 'MM/dd/yyyy', new Date());
      if (isValid(parsedDate)) {
        where.publishedDate = parsedDate;
      } else {
        throw new BadRequestException('Invalid date format. Please use MM/dd/yyyy.');
      }
    }
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
      ];
    }

    return this.databaseService.book.findMany({
      where,
    });
  }


  async update(id: number, updateBookDto: Prisma.BookUpdateInput) {
    let parsedDate: Date | undefined;
  
    if (updateBookDto.publishedDate) {
      const { publishedDate } = updateBookDto;
      if (typeof publishedDate === 'string') {
        parsedDate = parse(publishedDate, 'MM/dd/yyyy', new Date());
        if (!isValid(parsedDate)) {
          throw new BadRequestException('Invalid date format. Please use MM/dd/yyyy.');
        }
      } else if (publishedDate instanceof Date) {
        parsedDate = publishedDate;
      } else {
        throw new BadRequestException('Invalid publishedDate format.');
      }
    }
  
    return this.databaseService.book.update({
      where: { id },
      data: {
        ...updateBookDto,
        publishedDate: parsedDate,
      },
    });
  }


  async remove(id: number): Promise<Book> {
    const existingBook = await this.databaseService.book.findUnique({
      where: { id },
    });

    if (!existingBook) {
      throw new NotFoundException(`Book with ID ${id} not found.`);
    }

    return this.databaseService.book.delete({
      where: { id },
    });
  }
}
