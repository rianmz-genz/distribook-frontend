import api from './api';
import { Book, ApiResponse } from '@/types';
import { createLogger } from '@/utils/logger';

const logger = createLogger('BookService');

export const bookService = {
  async getAllBooks(): Promise<Book[]> {
    logger.info('Fetching all books');
    logger.time('getAllBooks');
    
    try {
      const response = await api.get<ApiResponse<Book[]>>('/books');
      const books = response.data.data || [];
      
      logger.timeEnd('getAllBooks');
      logger.info('Books fetched successfully', { count: books.length });
      
      return books;
    } catch (error) {
      logger.timeEnd('getAllBooks');
      logger.error('Failed to fetch books', error);
      throw error;
    }
  },

  async getBookById(id: number): Promise<Book> {
    logger.info('Fetching book by ID', { bookId: id });
    
    try {
      const response = await api.get<ApiResponse<Book>>(`/books/${id}`);
      const book = response.data.data;
      
      if (!book) {
        throw new Error('Book not found');
      }
      
      logger.info('Book fetched successfully', { 
        bookId: book.id, 
        title: book.title 
      });
      
      return book;
    } catch (error) {
      logger.error('Failed to fetch book', error, { bookId: id });
      throw error;
    }
  },

  async searchBooks(query: string): Promise<Book[]> {
    logger.info('Searching books', { query });
    
    try {
      const response = await api.get<ApiResponse<Book[]>>('/books', {
        params: { search: query },
      });
      const books = response.data.data || [];
      
      logger.info('Book search completed', { 
        query, 
        resultsCount: books.length 
      });
      
      return books;
    } catch (error) {
      logger.error('Book search failed', error, { query });
      throw error;
    }
  },

  // Client-side filtering for when API doesn't support search
  filterBooks(books: Book[], query: string): Book[] {
    if (!query.trim()) {
      return books;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = books.filter(
      (book) =>
        book.title.toLowerCase().includes(lowerQuery) ||
        book.author.toLowerCase().includes(lowerQuery) ||
        book.publisher.toLowerCase().includes(lowerQuery)
    );

    logger.debug('Books filtered locally', { 
      query, 
      totalBooks: books.length, 
      filteredCount: filtered.length 
    });

    return filtered;
  },
};

export default bookService;
