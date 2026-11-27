import { Router } from 'express';
import type { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';

import type { Logger } from '../shared/logger/logger.interface.js';
import type { ControllerInterface } from './controller.interface.js';
import type { Route } from './route.interface.js';
import { HttpMethod } from './http-method.enum.js';

import { injectable } from 'inversify';

@injectable()
export abstract class Controller implements ControllerInterface {
  public readonly router: Router;

  public constructor(protected readonly logger: Logger) {
    this.router = Router();
  }

  protected addRoute(route: Route): void {
    const middlewares = (route.middlewares ?? []).map((middleware) =>
      asyncHandler(middleware.execute.bind(middleware)),
    );

    const handler = asyncHandler(route.handler.bind(this));

    const handlers = [...middlewares, handler];

    switch (route.method) {
      case HttpMethod.Get:
        this.router.get(route.path, ...handlers);
        break;

      case HttpMethod.Post:
        this.router.post(route.path, ...handlers);
        break;

      case HttpMethod.Put:
        this.router.put(route.path, ...handlers);
        break;

      case HttpMethod.Delete:
        this.router.delete(route.path, ...handlers);
        break;

      case HttpMethod.Patch:
        this.router.patch(route.path, ...handlers);
        break;

      default:
        throw new Error('Неизвестный HTTP-метод');
    }
  }

  protected send<T>(res: Response, statusCode: number, data: T): void {
    res.status(statusCode).json(data);
  }

  protected ok<T>(res: Response, data: T): void {
    this.send(res, StatusCodes.OK, data);
  }

  protected created<T>(res: Response, data: T): void {
    this.send(res, StatusCodes.CREATED, data);
  }

  protected noContent(res: Response): void {
    res.status(StatusCodes.NO_CONTENT).send();
  }
}
