import React, { useEffect, useState } from 'react';
import { LogIn, LogOut, CheckCircle } from 'lucide-react';
import { Card, Button, Loading } from '@/components/common';
import { attendanceService } from '@/services';
import { TodayAttendance } from '@/types';
import { useAppDispatch } from '@/store';
import { addToast } from '@/store/uiSlice';
import { createLogger } from '@/utils/logger';

const logger = createLogger('AttendancePage');

const AttendancePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [attendance, setAttendance] = useState<TodayAttendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchAttendance = async () => {
    logger.info('Fetching today\'s attendance');
    try {
      const data = await attendanceService.getTodayAttendance();
      setAttendance(data);
    } catch (error) {
      logger.error('Failed to fetch attendance', error);
      dispatch(addToast({
        type: 'error',
        message: 'Gagal memuat data absensi',
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleCheckIn = async () => {
    logger.info('Submitting check-in');
    setSubmitting(true);
    try {
      const data = await attendanceService.submitAttendance('check_in');
      setAttendance(data);
      dispatch(addToast({
        type: 'success',
        message: 'Berhasil check-in!',
      }));
    } catch (error) {
      logger.error('Check-in failed', error);
      dispatch(addToast({
        type: 'error',
        message: 'Gagal melakukan check-in',
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    logger.info('Submitting check-out');
    setSubmitting(true);
    try {
      const data = await attendanceService.submitAttendance('check_out');
      setAttendance(data);
      dispatch(addToast({
        type: 'success',
        message: 'Berhasil check-out!',
      }));
    } catch (error) {
      logger.error('Check-out failed', error);
      dispatch(addToast({
        type: 'error',
        message: 'Gagal melakukan check-out',
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const hasCheckedIn = attendanceService.hasCheckedIn(attendance);
  const hasCheckedOut = attendanceService.hasCheckedOut(attendance);

  const currentTime = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (loading) {
    return <Loading text="Memuat data absensi..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Absensi
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Catat kehadiran Anda hari ini
        </p>
      </div>

      {/* Current Time Card */}
      <Card className="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
        <div className="text-center py-4">
          <p className="text-purple-200 mb-2">{currentDate}</p>
          <p className="text-4xl font-bold font-mono">{currentTime}</p>
        </div>
      </Card>

      {/* Attendance Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Check In Card */}
        <Card>
          <div className="flex items-center gap-4 mb-4">
            <div className={`
              p-3 rounded-xl
              ${hasCheckedIn 
                ? 'bg-green-100 dark:bg-green-900/30' 
                : 'bg-gray-100 dark:bg-gray-700'
              }
            `}>
              <LogIn className={`w-6 h-6 ${
                hasCheckedIn 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-gray-400'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Check In
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {hasCheckedIn 
                  ? attendanceService.formatTime(attendance?.check_in || null)
                  : 'Belum check-in'
                }
              </p>
            </div>
            {hasCheckedIn && (
              <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
            )}
          </div>
          
          {!hasCheckedIn && (
            <Button
              variant="secondary"
              fullWidth
              loading={submitting}
              onClick={handleCheckIn}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Check In Sekarang
            </Button>
          )}
        </Card>

        {/* Check Out Card */}
        <Card>
          <div className="flex items-center gap-4 mb-4">
            <div className={`
              p-3 rounded-xl
              ${hasCheckedOut 
                ? 'bg-green-100 dark:bg-green-900/30' 
                : 'bg-gray-100 dark:bg-gray-700'
              }
            `}>
              <LogOut className={`w-6 h-6 ${
                hasCheckedOut 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-gray-400'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Check Out
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {hasCheckedOut 
                  ? attendanceService.formatTime(attendance?.check_out || null)
                  : 'Belum check-out'
                }
              </p>
            </div>
            {hasCheckedOut && (
              <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
            )}
          </div>
          
          {hasCheckedIn && !hasCheckedOut && (
            <Button
              variant="outline"
              fullWidth
              loading={submitting}
              onClick={handleCheckOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Check Out Sekarang
            </Button>
          )}
          
          {!hasCheckedIn && (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
              Check-in terlebih dahulu
            </p>
          )}
        </Card>
      </div>

      {/* Completion Status */}
      {hasCheckedIn && hasCheckedOut && (
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            <div>
              <h3 className="font-medium text-green-800 dark:text-green-300">
                Absensi Lengkap!
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400">
                Anda sudah menyelesaikan absensi hari ini
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AttendancePage;
