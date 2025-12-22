import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Book } from '@/types';
import { Card } from '@/components/common';
import { Button } from '@/components/common';
import { createLogger } from '@/utils/logger';

const logger = createLogger('BookCard');

interface BookCardProps {
  book: Book;
  onBorrow?: (book: Book) => void;
  showBorrowButton?: boolean;
}

const BookCard: React.FC<BookCardProps> = ({ 
  book, 
  onBorrow, 
  showBorrowButton = true 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    logger.debug('Book card clicked', { bookId: book.id, title: book.title });
    navigate(`/books/${book.id}`);
  };

  const handleBorrow = (e: React.MouseEvent) => {
    e.stopPropagation();
    logger.debug('Borrow button clicked', { bookId: book.id, title: book.title });
    onBorrow?.(book);
  };

  const isAvailable = book.available_stock > 0;

  return (
    <Card 
      hoverable 
      padding="none" 
      onClick={handleClick}
      className="overflow-hidden group flex flex-col h-full"
    >
      {/* Book Cover */}
      <div className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-700 overflow-hidden shrink-0">
        {book.cover_image ? (
          <img
            src={book.cover_image}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              logger.warn('Book cover image failed to load', { bookId: book.id });
              (e.target as HTMLImageElement).src = '/placeholder-book.png';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30">
            <span className="text-4xl">📚</span>
          </div>
        )}
        
        {/* Availability badge */}
        <div className={`
          absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium
          ${isAvailable 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' 
            : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
          }
        `}>
          {isAvailable ? `${book.available_stock} tersedia` : 'Habis'}
        </div>
      </div>

      {/* Book Info */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 mb-1 leading-tight">
          {book.title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">
          {book.author}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mb-2">
          <span className="truncate max-w-[60%]">{book.publisher}</span>
          <span className="shrink-0">{book.year_published}</span>
        </div>

        {showBorrowButton && (
          <div className="mt-auto">
            <Button
              variant={isAvailable ? 'secondary' : 'ghost'}
              size="sm"
              fullWidth
              disabled={!isAvailable}
              onClick={handleBorrow}
            >
              {isAvailable ? 'Pinjam' : 'Tidak Tersedia'}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default BookCard;
