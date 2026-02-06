type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatTimestamp(): string {
    return new Date().toISOString().replace('T', ' ').slice(0, 19);
  }

  private formatMessage(level: LogLevel, message: string, context?: string, data?: any): string {
    const timestamp = this.formatTimestamp();
    const levelEmoji = this.getLevelEmoji(level);
    const contextStr = context ? `[${context}]` : '';
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';

    return `${timestamp} ${levelEmoji} ${contextStr} ${message}${dataStr}`;
  }

  private getLevelEmoji(level: LogLevel): string {
    const emojis = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌'
    };
    return emojis[level];
  }

  private log(level: LogLevel, message: string, context?: string, data?: any): void {
    if (!this.isDevelopment && level === 'debug') return;

    const formattedMessage = this.formatMessage(level, message, context, data);

    switch (level) {
      case 'debug':
      case 'info':
        console.log(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'error':
        console.error(formattedMessage);
        break;
    }
  }

  debug(message: string, context?: string, data?: any): void {
    this.log('debug', message, context, data);
  }

  info(message: string, context?: string, data?: any): void {
    this.log('info', message, context, data);
  }

  warn(message: string, context?: string, data?: any): void {
    this.log('warn', message, context, data);
  }

  error(message: string, context?: string, data?: any): void {
    this.log('error', message, context, data);
  }

  // Métodos específicos para diferentes contextos
  auth(message: string, data?: any): void {
    this.info(message, 'AUTH', data);
  }

  middleware(message: string, data?: any): void {
    this.info(message, 'MIDDLEWARE', data);
  }

  database(message: string, data?: any): void {
    this.info(message, 'DATABASE', data);
  }

  api(message: string, data?: any): void {
    this.info(message, 'API', data);
  }

  session(message: string, data?: any): void {
    this.info(message, 'SESSION', data);
  }
}

// Instância singleton do logger
export const logger = new Logger();

// Exportar também como default para facilitar imports
export default logger;