type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  data?: unknown;
  stack?: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const getConfiguredLevel = (): LogLevel => {
  const level = import.meta.env.VITE_LOG_LEVEL as LogLevel;
  return LOG_LEVELS[level] !== undefined ? level : 'debug';
};

const shouldLog = (level: LogLevel): boolean => {
  const configuredLevel = getConfiguredLevel();
  return LOG_LEVELS[level] >= LOG_LEVELS[configuredLevel];
};

const formatTimestamp = (): string => {
  return new Date().toISOString();
};

const formatLogEntry = (entry: LogEntry): string => {
  const { timestamp, level, context, message, data } = entry;
  let formatted = `[${timestamp}] [${level.toUpperCase()}] [${context}] ${message}`;
  if (data !== undefined) {
    formatted += ` | Data: ${JSON.stringify(data, null, 2)}`;
  }
  return formatted;
};

const createLogEntry = (
  level: LogLevel,
  context: string,
  message: string,
  data?: unknown,
  error?: Error
): LogEntry => ({
  timestamp: formatTimestamp(),
  level,
  context,
  message,
  data,
  stack: error?.stack,
});

const logToConsole = (entry: LogEntry): void => {
  const formatted = formatLogEntry(entry);
  const consoleMethod = entry.level === 'debug' ? 'log' : entry.level;
  
  console[consoleMethod](formatted);
  
  if (entry.stack) {
    console[consoleMethod]('Stack trace:', entry.stack);
  }
};

// Store logs in memory for debugging
const logHistory: LogEntry[] = [];
const MAX_LOG_HISTORY = 1000;

const storeLog = (entry: LogEntry): void => {
  logHistory.push(entry);
  if (logHistory.length > MAX_LOG_HISTORY) {
    logHistory.shift();
  }
};

class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private log(level: LogLevel, message: string, data?: unknown, error?: Error): void {
    if (!shouldLog(level)) return;

    const entry = createLogEntry(level, this.context, message, data, error);
    storeLog(entry);
    logToConsole(entry);
  }

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error | unknown, data?: unknown): void {
    const err = error instanceof Error ? error : undefined;
    const errorData = error instanceof Error ? { errorMessage: error.message } : (typeof error === 'object' ? error : { error });
    const combinedData = typeof data === 'object' && data !== null 
      ? { ...(errorData as object), ...(data as object) }
      : errorData;
    this.log('error', message, combinedData, err);
  }

  // Group related logs
  group(label: string): void {
    if (shouldLog('debug')) {
      console.group(`[${this.context}] ${label}`);
    }
  }

  groupEnd(): void {
    if (shouldLog('debug')) {
      console.groupEnd();
    }
  }

  // Time operations
  time(label: string): void {
    if (shouldLog('debug')) {
      console.time(`[${this.context}] ${label}`);
    }
  }

  timeEnd(label: string): void {
    if (shouldLog('debug')) {
      console.timeEnd(`[${this.context}] ${label}`);
    }
  }

  // Table for structured data
  table(data: unknown): void {
    if (shouldLog('debug')) {
      console.table(data);
    }
  }
}

// Factory function to create logger instances
export const createLogger = (context: string): Logger => {
  return new Logger(context);
};

// Get log history for debugging
export const getLogHistory = (): LogEntry[] => [...logHistory];

// Clear log history
export const clearLogHistory = (): void => {
  logHistory.length = 0;
};

// Export log history to JSON
export const exportLogs = (): string => {
  return JSON.stringify(logHistory, null, 2);
};

// Default logger for general use
export const logger = createLogger('App');

export default Logger;
