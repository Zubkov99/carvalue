import { Expose, Transform } from 'class-transformer';

export class ReportDto {
  @Expose()
  id: number | string;

  @Expose()
  price: number;

  @Expose()
  year: number;

  @Expose()
  lng: number;

  @Expose()
  lat: number;

  @Expose()
  make: string;

  @Expose()
  model: string;

  @Expose()
  mileage: number;

  @Expose()
  approved: boolean;

  //OBJ -- original report entity
  // берет свойство из оригинальной сущности и возвращает нужное поле
  @Transform(({ obj }) => obj.user.id)
  @Expose()
  user_id: number;
}
