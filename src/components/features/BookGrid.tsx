import React from 'react';
import { Book } from '@/types';
import BookCard from './BookCard';
import { BookGridSkeleton } from '@/components/common';
import { createLogger } from '@/utils/logger';

const logger = createLogger('BookGrid');

interface BookGridProps {
  books: Book[];
  loading?: boolean;
  onBorrow?: (book: Book) => void;
  emptyMessage?: string;
}

const BookGrid: React.FC<BookGridProps> = ({
  books,
  loading = false,
  onBorrow,
  emptyMessage = 'Tidak ada buku ditemukan',
}) => {
  logger.debug('Rendering book grid', { 
    bookCount: books.length, 
    loading 
  });

  if (loading) {
    return <BookGridSkeleton count={8} />;
  }

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl">📚</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {emptyMessage}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Coba ubah kata kunci pencarian atau filter
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onBorrow={onBorrow}
        />
      ))}
    </div>
  );
};

export default BookGrid;
