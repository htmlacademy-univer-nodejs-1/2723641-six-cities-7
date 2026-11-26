import type { HydratedDocument } from 'mongoose';

import type { CreateCommentDto } from './dto/create-comment.dto.js';
import type { CommentEntity } from './comment.entity.js';

export type CreateCommentData = CreateCommentDto & {
  offerId: string;
};

export interface CommentService {
  findByOfferId(offerId: string): Promise<HydratedDocument<CommentEntity>[]>;

  create(dto: CreateCommentData): Promise<HydratedDocument<CommentEntity>>;

  deleteByOfferId(offerId: string): Promise<void>;
}
