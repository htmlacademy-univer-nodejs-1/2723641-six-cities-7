import type { Request, Response } from 'express';

import { inject, injectable } from 'inversify';

import { plainToInstance } from 'class-transformer';

import { StatusCodes } from 'http-status-codes';

import type { Logger } from '../shared/logger/logger.interface.js';

import type { OfferService } from '../modules/offer/offer-service.interface.js';

import type { CityName } from '../types/city.type.js';

import { OfferRdo } from '../rdo/offer.rdo.js';

import { HttpError } from '../errors/http-error.js';

import { Component } from '../types/component.enum.js';

import { Controller } from './controller.abstract.js';
import { HttpMethod } from './http-method.enum.js';

import { CreateOfferDto } from '../modules/offer/dto/create-offer.dto.js';
import { UpdateOfferDto } from '../modules/offer/dto/update-offer.dto.js';

import { ValidateDtoMiddleware } from '../middleware/validate-dto.middleware.js';
import { ValidateObjectIdMiddleware } from '../middleware/validate-objectid.middleware.js';

import { CITY_NAMES } from '../modules/offer/dto/city.dto.js';

@injectable()
export class OfferController extends Controller {
  constructor(
    @inject(Component.Logger)
      logger: Logger,

    @inject(Component.OfferService)
    private readonly offerService: OfferService,
  ) {
    super(logger);

    this.addRoute({
      path: '/',
      method: HttpMethod.Get,
      handler: this.index,
    });

    this.addRoute({
      path: '/',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [new ValidateDtoMiddleware(CreateOfferDto)],
    });

    this.addRoute({
      path: '/favorites',
      method: HttpMethod.Get,
      handler: this.favorites,
    });

    this.addRoute({
      path: '/premium/:city',
      method: HttpMethod.Get,
      handler: this.premium,
    });

    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Get,
      handler: this.show,
      middlewares: [new ValidateObjectIdMiddleware('offerId')],
    });

    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Put,
      handler: this.update,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new ValidateDtoMiddleware(UpdateOfferDto),
      ],
    });

    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Delete,
      handler: this.delete,
      middlewares: [new ValidateObjectIdMiddleware('offerId')],
    });

    this.addRoute({
      path: '/:offerId/favorite/:status',
      method: HttpMethod.Post,
      handler: this.setFavorite,
      middlewares: [new ValidateObjectIdMiddleware('offerId')],
    });
  }

  private async index(req: Request, res: Response): Promise<void> {
    const rawLimit = req.query.limit;
    let limit: number | undefined;

    if (rawLimit !== undefined) {
      if (typeof rawLimit !== 'string') {
        throw new HttpError(
          StatusCodes.BAD_REQUEST,
          'Некорректный параметр limit',
        );
      }

      limit = Number(rawLimit);

      if (!Number.isInteger(limit) || limit < 1 || limit > 60) {
        throw new HttpError(
          StatusCodes.BAD_REQUEST,
          'Параметр limit должен быть целым числом от 1 до 60',
        );
      }
    }

    const offers = await this.offerService.find(limit);

    const response = plainToInstance(
      OfferRdo,
      offers.map((offer) => offer.toObject()),
      {
        excludeExtraneousValues: true,
      },
    );

    this.ok(res, response);
  }

  private async show(req: Request, res: Response): Promise<void> {
    const offer = await this.offerService.findById(req.params.offerId);

    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, 'Предложение не найдено');
    }

    this.ok(
      res,
      plainToInstance(OfferRdo, offer.toObject(), {
        excludeExtraneousValues: true,
      }),
    );
  }

  private async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateOfferDto;

    const offer = await this.offerService.create(dto);

    this.created(
      res,
      plainToInstance(OfferRdo, offer.toObject(), {
        excludeExtraneousValues: true,
      }),
    );
  }

  private async update(req: Request, res: Response): Promise<void> {
    const offerId = req.params.offerId;
    const dto = req.body as UpdateOfferDto;

    const offer = await this.offerService.updateById(offerId, dto);

    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, 'Предложение не найдено');
    }

    this.ok(
      res,
      plainToInstance(OfferRdo, offer.toObject(), {
        excludeExtraneousValues: true,
      }),
    );
  }

  private async delete(req: Request, res: Response): Promise<void> {
    const offer = await this.offerService.deleteById(req.params.offerId);

    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, 'Предложение не найдено');
    }

    this.noContent(res);
  }

  private async premium(req: Request, res: Response): Promise<void> {
    const city = req.params.city;

    if (!CITY_NAMES.some((name) => name === city)) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Некорректное название города',
      );
    }

    const offers = await this.offerService.findPremium(city as CityName);

    this.ok(
      res,
      plainToInstance(
        OfferRdo,
        offers.map((offer) => offer.toObject()),
        {
          excludeExtraneousValues: true,
        },
      ),
    );
  }

  private async favorites(_req: Request, res: Response): Promise<void> {
    const offers = await this.offerService.findFavorites();

    this.ok(
      res,
      plainToInstance(
        OfferRdo,
        offers.map((offer) => offer.toObject()),
        {
          excludeExtraneousValues: true,
        },
      ),
    );
  }

  private async setFavorite(req: Request, res: Response): Promise<void> {
    const status = req.params.status;

    if (status !== '0' && status !== '1') {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Статус избранного должен быть 0 или 1',
      );
    }

    const isFavorite = status === '1';

    const offer = await this.offerService.setFavorite(
      req.params.offerId,
      isFavorite,
    );

    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, 'Предложение не найдено');
    }

    this.ok(
      res,
      plainToInstance(OfferRdo, offer.toObject(), {
        excludeExtraneousValues: true,
      }),
    );
  }
}
