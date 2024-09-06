/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, Delete,Query } from '@nestjs/common';
import { BookService } from './book.service';
import { Prisma } from '@prisma/client';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  //creating book
  @Post()
  create(@Body() createBookDto: Prisma.BookCreateInput) {
    return this.bookService.create(createBookDto);
  }

 //get the book by http://localhost:3000/book?id=1&author=John%20Doe&publishedDate=2023-09-01&q=programming
 
  @Get()
  findAll(@Query() query: { id?: string, author?: string, publishedDate?: string, q?: string }) {
    return this.bookService.findAll(query);
  }

  //update book by ID
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookDto: Prisma.BookUpdateInput) {
    return this.bookService.update(+id, updateBookDto);
  }

  //delete book by ID
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookService.remove(+id);
  }
}
