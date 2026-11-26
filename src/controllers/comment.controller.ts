import type { Request, Response } from 'express';

import { plainToInstance } from 'class-transformer';
import { StatusCodes } from 'http-status-codes';
import { inject, injectable } from 'inversify';

import type { Logger } from '../shared/logger/logger.interface.js';

import type { CommentService } from '../modules/comment/comment-service.interface.js';
import type { UserService } from '../modules/user/user-service.interface.js';
import type { OfferService } from '../modules/offer/offer-service.interface.js';

import { CreateCommentDto } from '../modules/comment/dto/create-comment.dto.js';

import { HttpError } from '../errors/http-error.js';
import { ValidateDtoMiddleware } from '../middleware/validate-dto.middleware.js';
import { ValidateObjectIdMiddleware } from '../middleware/validate-objectid.middleware.js';

import { CommentRdo } from '../rdo/comment.rdo.js';
import { Component } from '../types/component.enum.js';

import { Controller } from './controller.abstract.js';
import { HttpMethod } from './http-method.enum.js';

@injectable()
export class CommentController extends Controller {
  constructor(
    @inject(Component.Logger)
      logger: Logger,

    @inject(Component.CommentService)
    private readonly commentService: CommentService,

    @inject(Component.OfferService)
    private readonly offerService: OfferService,

    @inject(Component.UserService)
    private readonly userService: UserService,
  ) {
    super(logger);

    this.addRoute({
      path: '/:offerId/comments',
      method: HttpMethod.Get,
      handler: this.index,
      middlewares: [new ValidateObjectIdMiddleware('offerId')],
    });

    this.addRoute({
      path: '/:offerId/comments',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new ValidateDtoMiddleware(CreateCommentDto),
      ],
    });
  }

  private async index(req: Request, res: Response): Promise<void> {
    const offer = await this.offerService.findById(req.params.offerId);

    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, 'Предложение не найдено');
    }

    const comments = await this.commentService.findByOfferId(
      req.params.offerId,
    );

    const response = plainToInstance(
      CommentRdo,
      comments.map((comment) => comment.toObject()),
      { excludeExtraneousValues: true },
    );

    this.ok(res, response);
  }

  private async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateCommentDto;
    const offerId = req.params.offerId;

    const offer = await this.offerService.findById(offerId);

    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, 'Предложение не найдено');
    }

    const author = await this.userService.findById(dto.author);

    if (!author) {
      throw new HttpError(StatusCodes.NOT_FOUND, 'Пользователь не найден');
    }

    const comment = await this.commentService.create({
      ...dto,
      offerId,
    });

    const response = plainToInstance(CommentRdo, comment.toObject(), {
      excludeExtraneousValues: true,
    });

    this.created(res, response);
  }
}
