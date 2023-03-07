import {
  IsNumber,
  IsString,
  Min,
  Max,
  IsLatitude,
  IsLongitude,
} from 'class-validator';

export class CreateReportDto {
  @IsString()
  make: string;

  @IsString()
  model: string;

  // @Type(() => Number)
  @IsNumber()
  @Min(1930)
  @Max(2050)
  year: number;

  @Min(0)
  @Max(1000000)
  @IsNumber()
  // @Type(() => Number)
  mileage: number;

  @IsLongitude()
  lng: number;

  @IsLatitude()
  lat: number;

  // @IsNumber()
  // @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1000000)
  price: number;
}
