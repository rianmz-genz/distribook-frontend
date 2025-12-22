import React, { useEffect, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchLoanRequests, selectLoanRequests } from '@/store/loanSlice';
import { Card, Button, Loading } from '@/components/common';
import { LoanRequestCard } from '@/components/features';
import { LoanRequest } from '@/types';
import { createLogger } from '@/utils/logger';

const logger = createLogger('LoansPage');

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected' | 'returned';

const LoansPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const loanRequests = useAppSelector(selectLoanRequests);
  const { loading, error } = useAppSelector((state) => state.loans);
  
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  useEffect(() => {
    logger.info('Loans page mounted');
    dispatch(fetchLoanRequests());
  }, [dispatch]);

  const handleLoanClick = (loan: LoanRequest) => {
    logger.debug('Loan request clicked', { loanId: loan.id });
    // Could open a detail modal here
  };

  const filteredLoans = filterStatus === 'all'
    ? loanRequests
    : loanRequests.filter((loan) => loan.status === filterStatus);

  const statusFilters: { value: FilterStatus; label: string; count: number }[] = [
    { value: 'all', label: 'Semua', count: loanRequests.length },
    { value: 'pending', label: 'Menunggu', count: loanRequests.filter((l) => l.status === 'pending').length },
    { value: 'approved', label: 'Disetujui', count: loanRequests.filter((l) => l.status === 'approved').length },
    { value: 'rejected', label: 'Ditolak', count: loanRequests.filter((l) => l.status === 'rejected').length },
    { value: 'returned', label: 'Dikembalikan', count: loanRequests.filter((l) => l.status === 'returned').length },
  ];

  if (loading && loanRequests.length === 0) {
    return <Loading text="Memuat data peminjaman..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Peminjaman Saya
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Kelola dan pantau status peminjaman buku Anda
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => {
              logger.debug('Filter changed', { filter: filter.value });
              setFilterStatus(filter.value);
            }}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${filterStatus === filter.value
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              }
            `}
          >
            {filter.label}
            <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-white dark:bg-gray-700">
              {filter.count}
            </span>
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch(fetchLoanRequests())}
            className="mt-2"
          >
            Coba Lagi
          </Button>
        </Card>
      )}

      {/* Loan Requests List */}
      {filteredLoans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <ClipboardList className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {filterStatus === 'all' 
              ? 'Belum ada peminjaman'
              : `Tidak ada peminjaman dengan status "${statusFilters.find(f => f.value === filterStatus)?.label}"`
            }
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filterStatus === 'all'
              ? 'Mulai pinjam buku dari halaman Buku'
              : 'Coba filter dengan status lain'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLoans.map((loan) => (
            <LoanRequestCard
              key={loan.id}
              loanRequest={loan}
              onClick={handleLoanClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LoansPage;
