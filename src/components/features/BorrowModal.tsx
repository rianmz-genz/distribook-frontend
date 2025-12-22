import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Book } from '@/types';
import { Modal, Button, Input } from '@/components/common';
import { useAppDispatch, useAppSelector } from '@/store';
import { createLoanRequest } from '@/store/loanSlice';
import { addToast } from '@/store/uiSlice';
import { createLogger } from '@/utils/logger';

const logger = createLogger('BorrowModal');

interface BorrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
}

const BorrowModal: React.FC<BorrowModalProps> = ({ isOpen, onClose, book }) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.loans);
  
  // Default to tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];
  
  const [requestDate, setRequestDate] = useState(defaultDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!book) {
      logger.error('No book selected for borrowing');
      return;
    }

    logger.info('Submitting loan request', { 
      bookId: book.id, 
      requestDate 
    });

    try {
      await dispatch(createLoanRequest({
        book_id: book.id,
        request_date: requestDate,
      })).unwrap();

      dispatch(addToast({
        type: 'success',
        message: `Berhasil mengajukan peminjaman "${book.title}"`,
      }));

      logger.info('Loan request submitted successfully', { bookId: book.id });
      onClose();
    } catch (error) {
      logger.error('Failed to submit loan request', error);
      dispatch(addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Gagal mengajukan peminjaman',
      }));
    }
  };

  if (!book) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pinjam Buku"
      size="md"
    >
      <form onSubmit={handleSubmit}>
        {/* Book Info */}
        <div className="flex gap-4 mb-6">
          <div className="w-20 h-28 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            {book.cover_image ? (
              <img
                src={book.cover_image}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {book.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {book.author}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {book.publisher} • {book.year_published}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
              {book.available_stock} dari {book.total_stock} tersedia
            </p>
          </div>
        </div>

        {/* Date picker */}
        <div className="mb-6">
          <Input
            type="date"
            label="Tanggal Pengajuan"
            value={requestDate}
            onChange={(e) => setRequestDate(e.target.value)}
            min={defaultDate}
            leftIcon={<Calendar className="w-4 h-4" />}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Pilih tanggal kapan Anda ingin meminjam buku ini
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="flex-1"
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="secondary"
            loading={loading}
            className="flex-1"
          >
            Ajukan Peminjaman
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BorrowModal;
