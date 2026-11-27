import { Type } from 'class-transformer';
import { IsIn, ValidateNested } from 'class-validator';

import type { CityName } from '../../../types/city.type.js';
import { LocationDto } from './location.dto.js';

export const CITY_NAMES = [
  'Paris',
  'Cologne',
  'Brussels',
  'Amsterdam',
  'Hamburg',
  'Dusseldorf',
] as const;

export class CityDto {
  @IsIn(CITY_NAMES)
  public name!: CityName;

  @ValidateNested()
  @Type(() => LocationDto)
  public location!: LocationDto;
}
