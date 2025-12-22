import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, User, Building, Calendar, Hash } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchBookById, setCurrentBook } from '@/store/bookSlice';
import { Button, Card, Loading } from '@/components/common';
import { BorrowModal } from '@/components/features';
import { createLogger } from '@/utils/logger';

const logger = createLogger('BookDetailPage');

const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentBook, loading, error } = useAppSelector((state) => state.books);
  
  const [showBorrowModal, setShowBorrowModal] = useState(false);

  useEffect(() => {
    if (id) {
      logger.info('Fetching book details', { bookId: id });
      dispatch(fetchBookById(parseInt(id)));
    }

    return () => {
      dispatch(setCurrentBook(null));
    };
  }, [id, dispatch]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleBorrow = () => {
    if (currentBook) {
      logger.debug('Opening borrow modal', { bookId: currentBook.id });
      setShowBorrowModal(true);
    }
  };

  if (loading) {
    return <Loading text="Memuat detail buku..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="outline" onClick={handleBack}>
          Kembali
        </Button>
      </div>
    );
  }

  if (!currentBook) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 mb-4">Buku tidak ditemukan</p>
        <Button variant="outline" onClick={handleBack}>
          Kembali
        </Button>
      </div>
    );
  }

  const isAvailable = currentBook.available_stock > 0;

  const bookInfo = [
    { icon: <User className="w-4 h-4" />, label: 'Penulis', value: currentBook.author },
    { icon: <Building className="w-4 h-4" />, label: 'Penerbit', value: currentBook.publisher },
    { icon: <Calendar className="w-4 h-4" />, label: 'Tahun Terbit', value: currentBook.year_published },
    { icon: <Hash className="w-4 h-4" />, label: 'ISBN', value: currentBook.isbn || '-' },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Kembali</span>
      </button>

      {/* Book Detail Card */}
      <Card>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Book Cover */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden">
              {currentBook.cover_image ? (
                <img
                  src={currentBook.cover_image}
                  alt={currentBook.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-book.png';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Book Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {currentBook.title}
            </h1>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {bookInfo.map((info, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400">
                    {info.icon}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{info.label}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {info.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            {currentBook.description && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Deskripsi
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {currentBook.description}
                </p>
              </div>
            )}

            {/* Stock Info */}
            <div className="flex items-center gap-4 mb-6">
              <div className={`
                px-4 py-2 rounded-lg
                ${isAvailable 
                  ? 'bg-green-100 dark:bg-green-900/30' 
                  : 'bg-red-100 dark:bg-red-900/30'
                }
              `}>
                <p className={`text-sm font-medium ${
                  isAvailable 
                    ? 'text-green-700 dark:text-green-400' 
                    : 'text-red-700 dark:text-red-400'
                }`}>
                  {isAvailable 
                    ? `${currentBook.available_stock} dari ${currentBook.total_stock} tersedia`
                    : 'Tidak tersedia'
                  }
                </p>
              </div>
            </div>

            {/* Action Button */}
            <Button
              variant="secondary"
              size="lg"
              disabled={!isAvailable}
              onClick={handleBorrow}
            >
              <BookOpen className="w-5 h-5 mr-2" />
              {isAvailable ? 'Pinjam Buku Ini' : 'Tidak Tersedia'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Borrow Modal */}
      <BorrowModal
        isOpen={showBorrowModal}
        onClose={() => setShowBorrowModal(false)}
        book={currentBook}
      />
    </div>
  );
};

export default BookDetailPage;
