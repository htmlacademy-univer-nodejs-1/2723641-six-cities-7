import type { NextFunction, Request, Response } from 'express';

import { plainToInstance } from 'class-transformer';
import type { ClassConstructor } from 'class-transformer';

import { validate } from 'class-validator';

import { StatusCodes } from 'http-status-codes';

import { HttpError } from '../errors/http-error.js';
import type { Middleware } from './middleware.interface.js';

export class ValidateDtoMiddleware implements Middleware {
  constructor(private readonly dtoClass: ClassConstructor<object>) {}

  public async execute(
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> {
    const dto = plainToInstance(this.dtoClass, req.body);

    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    });

    if (errors.length > 0) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Некорректные данные запроса',
      );
    }

    req.body = dto;

    next();
  }
}
