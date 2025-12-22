import React, { useEffect, useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchBooks, setSearchQuery, selectFilteredBooks } from '@/store/bookSlice';
import { Button, Card } from '@/components/common';
import { BookGrid, BorrowModal } from '@/components/features';
import { Book } from '@/types';
import { createLogger } from '@/utils/logger';

const logger = createLogger('BooksPage');

const BooksPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const books = useAppSelector(selectFilteredBooks);
  const { loading, searchQuery } = useAppSelector((state) => state.books);
  
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    logger.info('Books page mounted');
    dispatch(fetchBooks());
  }, [dispatch]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        logger.debug('Search query updated', { query: localSearch });
        dispatch(setSearchQuery(localSearch));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, searchQuery, dispatch]);

  const handleBorrow = (book: Book) => {
    logger.debug('Opening borrow modal', { bookId: book.id });
    setSelectedBook(book);
    setShowBorrowModal(true);
  };

  const handleCloseBorrowModal = () => {
    setShowBorrowModal(false);
    setSelectedBook(null);
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    dispatch(setSearchQuery(''));
  };

  // Get unique values for filters
  const allBooks = useAppSelector((state) => state.books.books);
  const publishers = [...new Set(allBooks.map((b) => b.publisher))].filter(Boolean);
  const years = [...new Set(allBooks.map((b) => b.year_published))].filter(Boolean).sort().reverse();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Daftar Buku
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Temukan dan pinjam buku yang Anda butuhkan
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari judul, penulis, atau penerbit..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
          {localSearch && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="sm:w-auto"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Penerbit
              </label>
              <select className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">Semua Penerbit</option>
                {publishers.map((publisher) => (
                  <option key={publisher} value={publisher}>
                    {publisher}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tahun Terbit
              </label>
              <select className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">Semua Tahun</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ketersediaan
              </label>
              <select className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">Semua</option>
                <option value="available">Tersedia</option>
                <option value="unavailable">Tidak Tersedia</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {loading ? 'Memuat...' : `${books.length} buku ditemukan`}
        </p>
      </div>

      {/* Book Grid */}
      <BookGrid
        books={books}
        loading={loading}
        onBorrow={handleBorrow}
        emptyMessage={searchQuery ? 'Tidak ada buku yang cocok dengan pencarian' : 'Belum ada buku tersedia'}
      />

      {/* Borrow Modal */}
      <BorrowModal
        isOpen={showBorrowModal}
        onClose={handleCloseBorrowModal}
        book={selectedBook}
      />
    </div>
  );
};

export default BooksPage;
