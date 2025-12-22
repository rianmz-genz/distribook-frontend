import api from './api';
import { LoanRequest, CreateLoanRequest, ApiResponse } from '@/types';
import { createLogger } from '@/utils/logger';

const logger = createLogger('LoanService');

export const loanService = {
  async getLoanRequests(): Promise<LoanRequest[]> {
    logger.info('Fetching loan requests');
    logger.time('getLoanRequests');
    
    try {
      const response = await api.get<ApiResponse<LoanRequest[]>>('/loanrequests');
      const loanRequests = response.data.data || [];
      
      logger.timeEnd('getLoanRequests');
      logger.info('Loan requests fetched successfully', { 
        count: loanRequests.length 
      });
      
      // Log summary of loan statuses
      const statusSummary = loanRequests.reduce((acc, req) => {
        acc[req.status] = (acc[req.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      logger.debug('Loan requests status summary', statusSummary);
      
      return loanRequests;
    } catch (error) {
      logger.timeEnd('getLoanRequests');
      logger.error('Failed to fetch loan requests', error);
      throw error;
    }
  },

  async createLoanRequest(data: CreateLoanRequest): Promise<LoanRequest> {
    logger.info('Creating loan request', { 
      bookId: data.book_id, 
      requestDate: data.request_date 
    });
    
    try {
      const response = await api.post<ApiResponse<LoanRequest>>('/loanrequests', data);
      const loanRequest = response.data.data;
      
      if (!loanRequest) {
        throw new Error('Failed to create loan request');
      }
      
      logger.info('Loan request created successfully', { 
        loanRequestId: loanRequest.id,
        bookId: data.book_id,
        status: loanRequest.status,
      });
      
      return loanRequest;
    } catch (error) {
      logger.error('Failed to create loan request', error, { 
        bookId: data.book_id 
      });
      throw error;
    }
  },

  // Helper to format loan status for display
  getStatusLabel(status: string): string {
    const statusLabels: Record<string, string> = {
      pending: 'Menunggu',
      approved: 'Disetujui',
      rejected: 'Ditolak',
      returned: 'Dikembalikan',
    };
    return statusLabels[status] || status;
  },

  // Helper to get status color
  getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      pending: 'yellow',
      approved: 'green',
      rejected: 'red',
      returned: 'blue',
    };
    return statusColors[status] || 'gray';
  },

  // Check if loan is overdue
  isOverdue(loan: LoanRequest): boolean {
    if (!loan.loan?.due_date || loan.loan.is_returned) {
      return false;
    }
    
    const dueDate = new Date(loan.loan.due_date);
    const today = new Date();
    const isOverdue = today > dueDate;
    
    if (isOverdue) {
      logger.debug('Loan is overdue', { 
        loanRequestId: loan.id, 
        dueDate: loan.loan.due_date 
      });
    }
    
    return isOverdue;
  },

  // Calculate days until due or days overdue
  getDaysUntilDue(loan: LoanRequest): number | null {
    if (!loan.loan?.due_date) {
      return null;
    }
    
    const dueDate = new Date(loan.loan.due_date);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  },
};

export default loanService;
