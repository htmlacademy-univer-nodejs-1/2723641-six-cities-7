import { inject, injectable } from 'inversify';

import { Types } from 'mongoose';
import type { HydratedDocument, Model } from 'mongoose';

import { Component } from '../../types/component.enum.js';
import type { OfferEntity } from '../offer/offer.entity.js';

import type { CommentEntity } from './comment.entity.js';

import type {
  CommentService,
  CreateCommentData,
} from './comment-service.interface.js';

type RatingResult = {
  _id: null;
  commentCount: number;
  rating: number;
};

@injectable()
export class DefaultCommentService implements CommentService {
  constructor(
    @inject(Component.CommentModel)
    private readonly commentModel: Model<CommentEntity>,

    @inject(Component.OfferModel)
    private readonly offerModel: Model<OfferEntity>,
  ) {}

  public async findByOfferId(
    offerId: string,
  ): Promise<HydratedDocument<CommentEntity>[]> {
    return this.commentModel
      .find({ offerId })
      .sort({ publicationDate: -1 })
      .limit(50)
      .populate('author')
      .exec();
  }

  public async create(
    dto: CreateCommentData,
  ): Promise<HydratedDocument<CommentEntity>> {
    const comment = await this.commentModel.create({
      text: dto.text,
      rating: dto.rating,
      author: new Types.ObjectId(dto.author),
      offerId: new Types.ObjectId(dto.offerId),
      publicationDate: new Date(),
    });

    await this.recalculateOffer(dto.offerId);

    await comment.populate('author');

    return comment;
  }

  public async deleteByOfferId(offerId: string): Promise<void> {
    await this.commentModel.deleteMany({ offerId }).exec();
  }

  private async recalculateOffer(offerId: string): Promise<void> {
    const [result] = await this.commentModel.aggregate<RatingResult>([
      {
        $match: {
          offerId: new Types.ObjectId(offerId),
        },
      },
      {
        $group: {
          _id: null,
          commentCount: { $sum: 1 },
          rating: { $avg: '$rating' },
        },
      },
    ]);

    await this.offerModel
      .findByIdAndUpdate(offerId, {
        commentCount: result?.commentCount ?? 0,
        rating: result ? Number(result.rating.toFixed(1)) : 0,
      })
      .exec();
  }
}
