import { Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';
import * as winston from 'winston';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;
  private context?: string;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
      ),
      defaultMeta: {
        service: process.env.SERVICE_NAME || 'nexo-service',
        environment: process.env.NODE_ENV || 'development',
      },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp, context, ...metadata }) => {
              let msg = `${timestamp} [${level}]`;
              if (context) {
                msg += ` [${context}]`;
              }
              msg += `: ${message}`;
              
              const metaStr = JSON.stringify(metadata);
              if (metaStr !== '{}') {
                msg += ` ${metaStr}`;
              }
              return msg;
            })
          ),
        }),
      ],
    });

    // Add file transport for production
    if (process.env.NODE_ENV === 'production') {
      this.logger.add(
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        })
      );
      this.logger.add(
        new winston.transports.File({
          filename: 'logs/combined.log',
        })
      );
    }
  }

  setContext(context: string) {
    this.context = context;
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context: context || this.context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context: context || this.context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context: context || this.context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context: context || this.context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context: context || this.context });
  }

  // Additional methods for structured logging
  info(message: string, meta?: any) {
    this.logger.info(message, { ...meta, context: this.context });
  }

  http(message: string, meta?: any) {
    this.logger.http(message, { ...meta, context: this.context });
  }
}
