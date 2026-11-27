import { Type } from 'class-transformer';

import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDate,
  IsIn,
  IsInt,
  IsMongoId,
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

export const HOUSING_TYPES = ['apartment', 'house', 'room', 'hotel'] as const;

export const AMENITIES = [
  'Breakfast',
  'Air conditioning',
  'Laptop friendly workspace',
  'Baby seat',
  'Washer',
  'Towels',
  'Fridge',
] as const;

export class CreateOfferDto {
  @IsString()
  @Length(10, 100)
  public title!: string;

  @IsString()
  @Length(20, 1024)
  public description!: string;

  @Type(() => Date)
  @IsDate()
  public publicationDate!: Date;

  @ValidateNested()
  @Type(() => CityDto)
  public city!: CityDto;

  @IsUrl()
  public previewImage!: string;

  @IsArray()
  @ArrayMinSize(6)
  @ArrayMaxSize(6)
  @IsUrl({}, { each: true })
  public images!: string[];

  @IsBoolean()
  public isPremium!: boolean;

  @IsBoolean()
  public isFavorite!: boolean;

  @IsIn(HOUSING_TYPES)
  public housingType!: HousingType;

  @IsInt()
  @Min(1)
  @Max(8)
  public roomCount!: number;

  @IsInt()
  @Min(1)
  @Max(10)
  public guestCount!: number;

  @IsInt()
  @Min(100)
  @Max(100000)
  public rentPrice!: number;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsIn(AMENITIES, { each: true })
  public amenities!: Amenity[];

  @IsMongoId()
  public author!: string;

  @ValidateNested()
  @Type(() => LocationDto)
  public location!: LocationDto;
}
