import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ClipboardList, Clock, Bell, ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchBooks, selectFilteredBooks } from '@/store/bookSlice';
import { fetchLoanRequests, selectPendingLoans, selectOverdueLoans } from '@/store/loanSlice';
import { Card, CardTitle, Button } from '@/components/common';
import { BookGrid, BorrowModal } from '@/components/features';
import { Book } from '@/types';
import { createLogger } from '@/utils/logger';

const logger = createLogger('HomePage');

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const books = useAppSelector(selectFilteredBooks);
  const booksLoading = useAppSelector((state) => state.books.loading);
  const pendingLoans = useAppSelector(selectPendingLoans);
  const overdueLoans = useAppSelector(selectOverdueLoans);
  
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showBorrowModal, setShowBorrowModal] = useState(false);

  useEffect(() => {
    logger.info('Home page mounted, fetching data');
    dispatch(fetchBooks());
    dispatch(fetchLoanRequests());
  }, [dispatch]);

  const handleBorrow = (book: Book) => {
    logger.debug('Opening borrow modal', { bookId: book.id });
    setSelectedBook(book);
    setShowBorrowModal(true);
  };

  const handleCloseBorrowModal = () => {
    setShowBorrowModal(false);
    setSelectedBook(null);
  };

  // Get recent books (first 4)
  const recentBooks = books.slice(0, 4);

  // Stats cards data
  const stats = [
    {
      label: 'Total Buku',
      value: books.length,
      icon: <BookOpen className="w-5 h-5" />,
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    },
    {
      label: 'Peminjaman Aktif',
      value: pendingLoans.length,
      icon: <ClipboardList className="w-5 h-5" />,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      label: 'Terlambat',
      value: overdueLoans.length,
      icon: <Clock className="w-5 h-5" />,
      color: overdueLoans.length > 0 
        ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
        : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              Selamat datang, {user?.name || 'User'}! 👋
            </h1>
            <p className="text-gray-300">
              Temukan dan pinjam buku favorit Anda di Distribook
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => navigate('/books')}
          >
            Jelajahi Buku
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="flex items-center gap-4 min-h-[88px]">
            <div className={`p-3 rounded-xl shrink-0 ${stat.color}`}>
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                {stat.value}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {stat.label}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Overdue Warning */}
      {overdueLoans.length > 0 && (
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Bell className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-red-800 dark:text-red-300">
                Perhatian!
              </h3>
              <p className="text-sm text-red-600 dark:text-red-400">
                Anda memiliki {overdueLoans.length} buku yang sudah melewati batas waktu pengembalian.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => navigate('/loans')}
            >
              Lihat Detail
            </Button>
          </div>
        </Card>
      )}

      {/* Recent Books */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Buku Terbaru</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/books')}
          >
            Lihat Semua
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <BookGrid
          books={recentBooks}
          loading={booksLoading}
          onBorrow={handleBorrow}
          emptyMessage="Belum ada buku tersedia"
        />
      </div>

      {/* Borrow Modal */}
      <BorrowModal
        isOpen={showBorrowModal}
        onClose={handleCloseBorrowModal}
        book={selectedBook}
      />
    </div>
  );
};

export default HomePage;
