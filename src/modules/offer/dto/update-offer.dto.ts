import { Type } from 'class-transformer';

import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

import type { Amenity } from '../../../types/amenity.type.js';
import type { HousingType } from '../../../types/housing-type.type.js';

import { CityDto } from './city.dto.js';
import { LocationDto } from './location.dto.js';

import { AMENITIES, HOUSING_TYPES } from './create-offer.dto.js';

export class UpdateOfferDto {
  @IsOptional()
  @IsString()
  @Length(10, 100)
  public title?: string;

  @IsOptional()
  @IsString()
  @Length(20, 1024)
  public description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CityDto)
  public city?: CityDto;

  @IsOptional()
  @IsUrl()
  public previewImage?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(6)
  @ArrayMaxSize(6)
  @IsUrl({}, { each: true })
  public images?: string[];

  @IsOptional()
  @IsBoolean()
  public isPremium?: boolean;

  @IsOptional()
  @IsBoolean()
  public isFavorite?: boolean;

  @IsOptional()
  @IsIn(HOUSING_TYPES)
  public housingType?: HousingType;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(8)
  public roomCount?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  public guestCount?: number;

  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(100000)
  public rentPrice?: number;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsIn(AMENITIES, { each: true })
  public amenities?: Amenity[];

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  public location?: LocationDto;
}
