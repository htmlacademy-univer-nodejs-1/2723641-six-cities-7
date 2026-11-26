import type { NextFunction, Request, Response } from 'express';

import { isObjectIdOrHexString } from 'mongoose';
import { StatusCodes } from 'http-status-codes';

import { HttpError } from '../errors/http-error.js';
import type { Middleware } from './middleware.interface.js';

export class ValidateObjectIdMiddleware implements Middleware {
  constructor(private readonly paramName: string) {}

  public execute(req: Request, _res: Response, next: NextFunction): void {
    const id = req.params[this.paramName];

    if (!isObjectIdOrHexString(id)) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        `Некорректный идентификатор: ${this.paramName}`,
      );
    }

    next();
  }
}
