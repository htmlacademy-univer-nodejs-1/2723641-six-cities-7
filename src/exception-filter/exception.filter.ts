import { inject, injectable } from 'inversify';

import type { NextFunction, Request, Response } from 'express';

import { StatusCodes } from 'http-status-codes';

import type { Logger } from '../shared/logger/logger.interface.js';

import { Component } from '../types/component.enum.js';

import { HttpError } from '../errors/http-error.js';

import type { ExceptionFilter } from './exception-filter.interface.js';

import { rm } from 'node:fs/promises';
import { MulterError } from 'multer';

@injectable()
export class AppExceptionFilter implements ExceptionFilter {
  constructor(
    @inject(Component.Logger)
    private readonly logger: Logger,
  ) {}

  public async catch(
    error: Error,
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    if (req.file && !res.locals.uploadCommitted) {
      try {
        await rm(req.file.path, { force: true });
      } catch (cleanupError: unknown) {
        const message =
          cleanupError instanceof Error
            ? cleanupError.message
            : String(cleanupError);

        this.logger.error(`Не удалось удалить файл: ${message}`);
      }
    }

    if (error instanceof MulterError) {
      const isTooLarge = error.code === 'LIMIT_FILE_SIZE';

      res
        .status(
          isTooLarge ? StatusCodes.REQUEST_TOO_LONG : StatusCodes.BAD_REQUEST,
        )
        .json({
          error: isTooLarge
            ? 'Размер файла не должен превышать 2 МиБ'
            : 'Некорректный запрос загрузки файла',
        });

      return;
    }

    if (error instanceof HttpError) {
      this.logger.warn(`HTTP Error ${error.statusCode}: ${error.message}`);

      res.status(error.statusCode).json({
        error: error.message,
      });

      return;
    }

    this.logger.error(`Server Error: ${error.message}`);

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Internal server error',
    });
  }
}
