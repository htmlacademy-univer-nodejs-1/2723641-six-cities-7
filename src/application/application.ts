import express from 'express';

import type { Express } from 'express';

import { inject, injectable } from 'inversify';

import type { Config } from '../shared/config/config.interface.js';
import type { Logger } from '../shared/logger/logger.interface.js';

import { Component } from '../types/component.enum.js';

import { OfferController } from '../controllers/offer.controller.js';
import { UserController } from '../controllers/user.controller.js';

import type { ExceptionFilter } from '../exception-filter/exception-filter.interface.js';

@injectable()
export class Application {
  private readonly server: Express;

  constructor(
    @inject(Component.Logger)
    private readonly logger: Logger,

    @inject(Component.Config)
    private readonly config: Config,

    @inject(Component.UserController)
    private readonly userController: UserController,

    @inject(Component.OfferController)
    private readonly offerController: OfferController,

    @inject(Component.ExceptionFilter)
    private readonly exceptionFilter: ExceptionFilter,
  ) {
    this.server = express();
  }

  public init(): void {
    this.logger.info('Приложение инициализировано');

    this.registerMiddleware();
    this.registerRoutes();
    this.registerExceptionFilters();

    const port = this.config.get('port');

    this.server.listen(port, () => {
      this.logger.info(`Сервер запущен на порту ${port}`);
    });
  }

  private registerMiddleware(): void {
    this.server.use(express.json());
  }

  private registerRoutes(): void {
    this.server.use('/users', this.userController.router);

    this.server.use('/offers', this.offerController.router);
  }

  private registerExceptionFilters(): void {
    this.server.use(this.exceptionFilter.catch.bind(this.exceptionFilter));
  }
}
