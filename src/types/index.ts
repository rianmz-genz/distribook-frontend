// User Types
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  role: string;
  created_at: string;
  updated_at: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  data: {
    token: string;
    user: User;
    session_id?: string;
  };
  message?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  sessionId: string | null;
  loading: boolean;
  error: string | null;
}

// Book Types
export interface Book {
  id: number;
  title: string;
  author: string;
  publisher: string;
  year_published: string;
  total_stock: number;
  available_stock: number;
  cover_image: string;
  isbn?: string;
  description?: string;
  categories?: string[];
}

export interface BookState {
  books: Book[];
  currentBook: Book | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
}

// Loan Types
export interface LoanReturn {
  return_date: string;
  is_damaged: boolean;
  is_lost: boolean;
  is_late: boolean;
  damage_description?: string;
  fine_amount: string;
  fine_type: string;
  replacement_instructions?: string;
}

export interface Loan {
  loan_date: string;
  due_date: string;
  return_date?: string;
  is_returned: boolean;
  return?: LoanReturn;
}

export interface LoanRequest {
  id: number;
  request_date: string;
  status: 'pending' | 'approved' | 'rejected' | 'returned';
  book: Book;
  loan?: Loan;
}

export interface CreateLoanRequest {
  book_id: number;
  request_date: string;
}

export interface LoanState {
  loanRequests: LoanRequest[];
  loading: boolean;
  error: string | null;
}

// Attendance Types
export interface TodayAttendance {
  id: number;
  name: string;
  check_in: string;
  check_out: string;
}

export interface AttendanceState {
  todayAttendance: TodayAttendance | null;
  loading: boolean;
  error: string | null;
}

// Announcement Types
export interface Announcement {
  subject: string;
  body: string;
  date: string;
  author_id: string;
}

export interface AnnouncementState {
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
}

// API Response Types
export interface ApiResponse<T> {
  status: 'success' | 'failed';
  data?: T;
  message?: string;
}

export interface ApiError {
  status: string;
  message: string;
  errors?: Record<string, string[]>;
}

// UI Types
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  toasts: ToastMessage[];
}
