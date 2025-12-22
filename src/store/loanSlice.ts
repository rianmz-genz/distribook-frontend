import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { LoanState, CreateLoanRequest } from '@/types';
import { loanService } from '@/services';
import { createLogger } from '@/utils/logger';

const logger = createLogger('LoanSlice');

const initialState: LoanState = {
  loanRequests: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchLoanRequests = createAsyncThunk(
  'loans/fetchLoanRequests',
  async (_, { rejectWithValue }) => {
    try {
      logger.info('Fetch loan requests thunk started');
      const loanRequests = await loanService.getLoanRequests();
      return loanRequests;
    } catch (error) {
      logger.error('Fetch loan requests thunk failed', error);
      const message = error instanceof Error ? error.message : 'Failed to fetch loan requests';
      return rejectWithValue(message);
    }
  }
);

export const createLoanRequest = createAsyncThunk(
  'loans/createLoanRequest',
  async (data: CreateLoanRequest, { rejectWithValue }) => {
    try {
      logger.info('Create loan request thunk started', { bookId: data.book_id });
      const loanRequest = await loanService.createLoanRequest(data);
      return loanRequest;
    } catch (error) {
      logger.error('Create loan request thunk failed', error, { bookId: data.book_id });
      const message = error instanceof Error ? error.message : 'Failed to create loan request';
      return rejectWithValue(message);
    }
  }
);

const loanSlice = createSlice({
  name: 'loans',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      logger.debug('Loan error cleared');
    },
    clearLoanRequests: (state) => {
      state.loanRequests = [];
      logger.debug('Loan requests cleared');
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch loan requests
      .addCase(fetchLoanRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
        logger.debug('Fetch loan requests pending');
      })
      .addCase(fetchLoanRequests.fulfilled, (state, action) => {
        state.loanRequests = action.payload;
        state.loading = false;
        state.error = null;
        logger.info('Fetch loan requests fulfilled', { count: action.payload.length });
      })
      .addCase(fetchLoanRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        logger.error('Fetch loan requests rejected', undefined, { error: action.payload });
      })
      // Create loan request
      .addCase(createLoanRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
        logger.debug('Create loan request pending');
      })
      .addCase(createLoanRequest.fulfilled, (state, action) => {
        state.loanRequests.unshift(action.payload);
        state.loading = false;
        state.error = null;
        logger.info('Create loan request fulfilled', { loanRequestId: action.payload.id });
      })
      .addCase(createLoanRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        logger.error('Create loan request rejected', undefined, { error: action.payload });
      });
  },
});

export const { clearError, clearLoanRequests } = loanSlice.actions;

// Selectors
export const selectLoanRequests = (state: { loans: LoanState }) => state.loans.loanRequests;
export const selectLoansLoading = (state: { loans: LoanState }) => state.loans.loading;
export const selectLoansError = (state: { loans: LoanState }) => state.loans.error;

export const selectPendingLoans = (state: { loans: LoanState }) =>
  state.loans.loanRequests.filter((loan) => loan.status === 'pending');

export const selectApprovedLoans = (state: { loans: LoanState }) =>
  state.loans.loanRequests.filter((loan) => loan.status === 'approved');

export const selectOverdueLoans = (state: { loans: LoanState }) =>
  state.loans.loanRequests.filter((loan) => loanService.isOverdue(loan));

export default loanSlice.reducer;
