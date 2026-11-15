import { Expose, Transform } from 'class-transformer';

export class OfferRdo {
  @Expose()
  @Transform(({ obj }) => obj._id.toString())
  public id!: string;

  @Expose()
  public title!: string;

  @Expose()
  public description!: string;

  @Expose()
  public publicationDate!: Date;

  @Expose()
  public city!: object;

  @Expose()
  public previewImage!: string;

  @Expose()
  public images!: string[];

  @Expose()
  public isPremium!: boolean;

  @Expose()
  public isFavorite!: boolean;

  @Expose()
  public rating!: number;

  @Expose()
  public housingType!: string;

  @Expose()
  public roomCount!: number;

  @Expose()
  public guestCount!: number;

  @Expose()
  public rentPrice!: number;

  @Expose()
  public amenities!: string[];

  @Expose()
  public author!: unknown;

  @Expose()
  public commentCount!: number;

  @Expose()
  public location!: object;
}
