import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import type { DocumentFinder } from '../shared/database/document-finder.interface.js';

import { HttpError } from '../errors/http-error.js';
import type { Middleware } from './middleware.interface.js';

export class CheckDocumentExistsMiddleware implements Middleware {
  constructor(
    private readonly service: DocumentFinder,
    private readonly getId: (req: Request) => string,
    private readonly errorMessage: string,
    private readonly localsKey = 'document',
  ) {}

  public async execute(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const document = await this.service.findById(this.getId(req));

    if (!document) {
      throw new HttpError(StatusCodes.NOT_FOUND, this.errorMessage);
    }

    res.locals[this.localsKey] = document;

    next();
  }
}
