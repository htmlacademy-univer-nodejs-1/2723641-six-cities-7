import type { Request, Response } from 'express';

import { inject, injectable } from 'inversify';

import { plainToInstance } from 'class-transformer';

import { StatusCodes } from 'http-status-codes';

import type { Logger } from '../shared/logger/logger.interface.js';

import type { OfferService } from '../modules/offer/offer-service.interface.js';

import type { CreateOfferDto } from '../modules/offer/dto/create-offer.dto.js';

import type { UpdateOfferDto } from '../modules/offer/dto/update-offer.dto.js';

import type { CityName } from '../types/city.type.js';

import { OfferRdo } from '../rdo/offer.rdo.js';

import { HttpError } from '../errors/http-error.js';

import { Component } from '../types/component.enum.js';

import { Controller } from './controller.abstract.js';
import { HttpMethod } from './http-method.enum.js';

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
    });

    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Put,
      handler: this.update,
    });

    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Delete,
      handler: this.delete,
    });

    this.addRoute({
      path: '/:offerId/favorite/:status',
      method: HttpMethod.Post,
      handler: this.setFavorite,
    });
  }

  private async index(req: Request, res: Response): Promise<void> {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

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
    const offers = await this.offerService.findPremium(
      req.params.city as CityName,
    );

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
    const isFavorite = req.params.status === '1';

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
