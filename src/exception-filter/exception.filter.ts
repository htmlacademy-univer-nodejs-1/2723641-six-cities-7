import { inject, injectable } from 'inversify';

import type { NextFunction, Request, Response } from 'express';

import { StatusCodes } from 'http-status-codes';

import type { Logger } from '../shared/logger/logger.interface.js';

import { Component } from '../types/component.enum.js';

import { HttpError } from '../errors/http-error.js';

import type { ExceptionFilter } from './exception-filter.interface.js';

@injectable()
export class AppExceptionFilter implements ExceptionFilter {
  constructor(
    @inject(Component.Logger)
    private readonly logger: Logger,
  ) {}

  public catch(
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
  ): void {
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
