import { createLogger } from '@/utils/logger';

const logger = createLogger('Environment');

export interface EnvironmentConfig {
  apiBaseUrl: string;
  apiTimeout: number;
  appName: string;
  appVersion: string;
  logLevel: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

const getEnvVar = (key: string, defaultValue: string = ''): string => {
  const value = import.meta.env[key];
  if (value === undefined || value === '') {
    logger.warn(`Environment variable ${key} is not set, using default: ${defaultValue}`);
    return defaultValue;
  }
  return value;
};

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = getEnvVar(key, String(defaultValue));
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    logger.warn(`Environment variable ${key} is not a valid number, using default: ${defaultValue}`);
    return defaultValue;
  }
  return parsed;
};

export const env: EnvironmentConfig = {
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', 'https://distribook.vastro.id/api'),
  apiTimeout: getEnvNumber('VITE_API_TIMEOUT', 20000),
  appName: getEnvVar('VITE_APP_NAME', 'Distribook'),
  appVersion: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  logLevel: getEnvVar('VITE_LOG_LEVEL', 'debug'),
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

// Log environment configuration on startup
logger.info('Environment configuration loaded', {
  apiBaseUrl: env.apiBaseUrl,
  apiTimeout: env.apiTimeout,
  appName: env.appName,
  appVersion: env.appVersion,
  logLevel: env.logLevel,
  isDevelopment: env.isDevelopment,
  isProduction: env.isProduction,
});

export default env;
