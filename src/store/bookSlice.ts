import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { BookState, Book } from '@/types';
import { bookService } from '@/services';
import { createLogger } from '@/utils/logger';

const logger = createLogger('BookSlice');

const initialState: BookState = {
  books: [],
  currentBook: null,
  loading: false,
  error: null,
  searchQuery: '',
};

// Async thunks
export const fetchBooks = createAsyncThunk(
  'books/fetchBooks',
  async (_, { rejectWithValue }) => {
    try {
      logger.info('Fetch books thunk started');
      const books = await bookService.getAllBooks();
      return books;
    } catch (error) {
      logger.error('Fetch books thunk failed', error);
      const message = error instanceof Error ? error.message : 'Failed to fetch books';
      return rejectWithValue(message);
    }
  }
);

export const fetchBookById = createAsyncThunk(
  'books/fetchBookById',
  async (id: number, { rejectWithValue }) => {
    try {
      logger.info('Fetch book by ID thunk started', { bookId: id });
      const book = await bookService.getBookById(id);
      return book;
    } catch (error) {
      logger.error('Fetch book by ID thunk failed', error, { bookId: id });
      const message = error instanceof Error ? error.message : 'Failed to fetch book';
      return rejectWithValue(message);
    }
  }
);

const bookSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      logger.debug('Search query set', { query: action.payload });
    },
    setCurrentBook: (state, action: PayloadAction<Book | null>) => {
      state.currentBook = action.payload;
      logger.debug('Current book set', { bookId: action.payload?.id });
    },
    clearError: (state) => {
      state.error = null;
      logger.debug('Book error cleared');
    },
    clearBooks: (state) => {
      state.books = [];
      state.currentBook = null;
      state.searchQuery = '';
      logger.debug('Books cleared');
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch books
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
        logger.debug('Fetch books pending');
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.books = action.payload;
        state.loading = false;
        state.error = null;
        logger.info('Fetch books fulfilled', { count: action.payload.length });
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        logger.error('Fetch books rejected', undefined, { error: action.payload });
      })
      // Fetch book by ID
      .addCase(fetchBookById.pending, (state) => {
        state.loading = true;
        state.error = null;
        logger.debug('Fetch book by ID pending');
      })
      .addCase(fetchBookById.fulfilled, (state, action) => {
        state.currentBook = action.payload;
        state.loading = false;
        state.error = null;
        logger.info('Fetch book by ID fulfilled', { bookId: action.payload.id });
      })
      .addCase(fetchBookById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        logger.error('Fetch book by ID rejected', undefined, { error: action.payload });
      });
  },
});

export const { setSearchQuery, setCurrentBook, clearError, clearBooks } = bookSlice.actions;

// Selectors
export const selectBooks = (state: { books: BookState }) => state.books.books;
export const selectCurrentBook = (state: { books: BookState }) => state.books.currentBook;
export const selectBooksLoading = (state: { books: BookState }) => state.books.loading;
export const selectBooksError = (state: { books: BookState }) => state.books.error;
export const selectSearchQuery = (state: { books: BookState }) => state.books.searchQuery;

export const selectFilteredBooks = (state: { books: BookState }) => {
  const { books, searchQuery } = state.books;
  return bookService.filterBooks(books, searchQuery);
};

export default bookSlice.reducer;
