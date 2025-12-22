import React from 'react';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';
import { LoanRequest } from '@/types';
import { Card } from '@/components/common';
import { StatusBadge } from '@/components/common';
import { loanService } from '@/services';
import { createLogger } from '@/utils/logger';

const logger = createLogger('LoanRequestCard');

interface LoanRequestCardProps {
  loanRequest: LoanRequest;
  onClick?: (loanRequest: LoanRequest) => void;
}

const LoanRequestCard: React.FC<LoanRequestCardProps> = ({ 
  loanRequest, 
  onClick 
}) => {
  const isOverdue = loanService.isOverdue(loanRequest);
  const daysUntilDue = loanService.getDaysUntilDue(loanRequest);

  const handleClick = () => {
    logger.debug('Loan request card clicked', { 
      loanRequestId: loanRequest.id,
      status: loanRequest.status 
    });
    onClick?.(loanRequest);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Card 
      hoverable 
      onClick={handleClick}
      className={`${isOverdue ? 'border-red-300 dark:border-red-800' : ''}`}
    >
      <div className="flex gap-4">
        {/* Book Cover */}
        <div className="w-20 h-28 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
          {loanRequest.book.cover_image ? (
            <img
              src={loanRequest.book.cover_image}
              alt={loanRequest.book.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-book.png';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
              {loanRequest.book.title}
            </h3>
            <StatusBadge status={loanRequest.status} size="sm" />
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            {loanRequest.book.author}
          </p>

          {/* Dates */}
          <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Tanggal pengajuan: {formatDate(loanRequest.request_date)}</span>
            </div>

            {loanRequest.loan && (
              <>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Tanggal pinjam: {formatDate(loanRequest.loan.loan_date)}</span>
                </div>
                <div className={`flex items-center gap-2 ${isOverdue ? 'text-red-500' : ''}`}>
                  {isOverdue && <AlertTriangle className="w-3.5 h-3.5" />}
                  <span>
                    Jatuh tempo: {formatDate(loanRequest.loan.due_date)}
                    {daysUntilDue !== null && (
                      <span className="ml-1">
                        ({daysUntilDue > 0 
                          ? `${daysUntilDue} hari lagi` 
                          : `terlambat ${Math.abs(daysUntilDue)} hari`
                        })
                      </span>
                    )}
                  </span>
                </div>
              </>
            )}

            {loanRequest.loan?.is_returned && loanRequest.loan.return_date && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <span>Dikembalikan: {formatDate(loanRequest.loan.return_date)}</span>
              </div>
            )}
          </div>

          {/* Fine info if any */}
          {loanRequest.loan?.return?.fine_amount && 
           parseFloat(loanRequest.loan.return.fine_amount) > 0 && (
            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-xs text-red-600 dark:text-red-400">
                Denda: Rp {parseFloat(loanRequest.loan.return.fine_amount).toLocaleString('id-ID')}
                {loanRequest.loan.return.fine_type && (
                  <span className="ml-1">({loanRequest.loan.return.fine_type})</span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default LoanRequestCard;
