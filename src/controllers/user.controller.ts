import type { Request, Response } from 'express';

import { inject, injectable } from 'inversify';

import { plainToInstance } from 'class-transformer';

import { StatusCodes } from 'http-status-codes';

import type { Logger } from '../shared/logger/logger.interface.js';

import type { UserService } from '../modules/user/user-service.interface.js';

import { UserRdo } from '../rdo/user.rdo.js';

import { HttpError } from '../errors/http-error.js';

import { Component } from '../types/component.enum.js';

import { Controller } from './controller.abstract.js';
import { HttpMethod } from './http-method.enum.js';

import { CreateUserDto } from '../modules/user/dto/create-user.dto.js';
import { ValidateDtoMiddleware } from '../middleware/validate-dto.middleware.js';

import { LoginUserDto } from '../modules/user/dto/login-user.dto.js';

import type { Config } from '../shared/config/config.interface.js';

import { ValidateObjectIdMiddleware } from '../middleware/validate-objectid.middleware.js';
import { CheckDocumentExistsMiddleware } from '../middleware/check-document-exists.middleware.js';
import { UploadFileMiddleware } from '../middleware/upload-file.middleware.js';

@injectable()
export class UserController extends Controller {
  constructor(
    @inject(Component.Logger)
      logger: Logger,

    @inject(Component.UserService)
    private readonly userService: UserService,

    @inject(Component.Config)
    private readonly config: Config,
  ) {
    super(logger);

    this.addRoute({
      path: '/',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [new ValidateDtoMiddleware(CreateUserDto)],
    });

    this.addRoute({
      path: '/login',
      method: HttpMethod.Post,
      handler: this.login,
      middlewares: [new ValidateDtoMiddleware(LoginUserDto)],
    });

    this.addRoute({
      path: '/logout',
      method: HttpMethod.Delete,
      handler: this.logout,
    });

    this.addRoute({
      path: '/status',
      method: HttpMethod.Get,
      handler: this.status,
    });

    this.addRoute({
      path: '/:userId/avatar',
      method: HttpMethod.Post,
      handler: this.uploadAvatar,
      middlewares: [
        new ValidateObjectIdMiddleware('userId'),
        new UploadFileMiddleware(this.config.get('uploadDirectory'), 'avatar'),
        new CheckDocumentExistsMiddleware(
          this.userService,
          (req) => req.params.userId,
          'Пользователь не найден',
          'user',
        ),
      ],
    });
  }

  private async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateUserDto;

    const existingUser = await this.userService.findByEmail(dto.email);

    if (existingUser) {
      throw new HttpError(
        StatusCodes.CONFLICT,
        'Пользователь с таким email уже существует',
      );
    }

    const user = await this.userService.create(dto);

    const response = plainToInstance(UserRdo, user.toObject(), {
      excludeExtraneousValues: true,
    });

    this.created(res, response);
  }

  private async login(_req: Request, _res: Response): Promise<void> {
    throw new HttpError(
      StatusCodes.NOT_IMPLEMENTED,
      'Авторизация пока не реализована',
    );
  }

  private async logout(_req: Request, _res: Response): Promise<void> {
    throw new HttpError(
      StatusCodes.NOT_IMPLEMENTED,
      'Выход пока не реализован',
    );
  }

  private async status(_req: Request, _res: Response): Promise<void> {
    throw new HttpError(
      StatusCodes.NOT_IMPLEMENTED,
      'Проверка авторизации пока не реализована',
    );
  }

  private async uploadAvatar(req: Request, res: Response): Promise<void> {
    const file = req.file;

    if (!file) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Необходимо передать файл аватара',
      );
    }

    const avatar = `/static/${file.filename}`;

    const user = await this.userService.updateAvatar(req.params.userId, avatar);

    if (!user) {
      throw new HttpError(StatusCodes.NOT_FOUND, 'Пользователь не найден');
    }

    res.locals.uploadCommitted = true;

    const response = plainToInstance(UserRdo, user.toObject(), {
      excludeExtraneousValues: true,
    });

    this.ok(res, response);
  }
}
