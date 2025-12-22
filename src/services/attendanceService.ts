import api from './api';
import { TodayAttendance, ApiResponse } from '@/types';
import { createLogger } from '@/utils/logger';

const logger = createLogger('AttendanceService');

export const attendanceService = {
  async getTodayAttendance(): Promise<TodayAttendance | null> {
    logger.info('Fetching today\'s attendance');
    
    try {
      const response = await api.post<ApiResponse<TodayAttendance>>('/attendance/today/');
      const attendance = response.data.data;
      
      if (attendance) {
        logger.info('Today\'s attendance fetched', {
          id: attendance.id,
          name: attendance.name,
          checkIn: attendance.check_in,
          checkOut: attendance.check_out,
        });
      } else {
        logger.info('No attendance record for today');
      }
      
      return attendance || null;
    } catch (error) {
      logger.error('Failed to fetch today\'s attendance', error);
      throw error;
    }
  },

  async submitAttendance(type: 'check_in' | 'check_out'): Promise<TodayAttendance> {
    logger.info('Submitting attendance', { type });
    
    try {
      const response = await api.post<ApiResponse<TodayAttendance>>('/attendance', {
        type,
      });
      
      const attendance = response.data.data;
      
      if (!attendance) {
        throw new Error('Failed to submit attendance');
      }
      
      logger.info('Attendance submitted successfully', {
        type,
        id: attendance.id,
        checkIn: attendance.check_in,
        checkOut: attendance.check_out,
      });
      
      return attendance;
    } catch (error) {
      logger.error('Failed to submit attendance', error, { type });
      throw error;
    }
  },

  // Helper to check if user has checked in today
  hasCheckedIn(attendance: TodayAttendance | null): boolean {
    const hasCheckedIn = !!attendance?.check_in;
    logger.debug('Checking if user has checked in', { hasCheckedIn });
    return hasCheckedIn;
  },

  // Helper to check if user has checked out today
  hasCheckedOut(attendance: TodayAttendance | null): boolean {
    const hasCheckedOut = !!attendance?.check_out;
    logger.debug('Checking if user has checked out', { hasCheckedOut });
    return hasCheckedOut;
  },

  // Format time for display
  formatTime(timeString: string | null): string {
    if (!timeString) return '-';
    
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      logger.error('Failed to format time', error, { timeString });
      return timeString;
    }
  },
};

export default attendanceService;
