import type { HydratedDocument } from 'mongoose';

import type { UserEntity } from './user.entity.js';
import type { CreateUserDto } from './dto/create-user.dto.js';

export interface UserService {
  findById(id: string): Promise<HydratedDocument<UserEntity> | null>;

  findByEmail(email: string): Promise<HydratedDocument<UserEntity> | null>;

  create(dto: CreateUserDto): Promise<HydratedDocument<UserEntity>>;

  updateAvatar(
    id: string,
    avatar: string,
  ): Promise<HydratedDocument<UserEntity> | null>;
}
