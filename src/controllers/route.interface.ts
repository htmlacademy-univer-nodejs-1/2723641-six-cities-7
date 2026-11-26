import type { NextFunction, Request, Response } from 'express';

import type { Middleware } from '../middleware/middleware.interface.js';
import type { HttpMethod } from './http-method.enum.js';

export type RouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => void | Promise<void>;

export interface Route {
  path: string;
  method: HttpMethod;
  handler: RouteHandler;
  middlewares?: Middleware[];
}
