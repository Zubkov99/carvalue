import { Expose } from 'class-transformer';

export class UserDto {
  // указываем, что эти свойства можна передавать наружу
  @Expose()
  id: number;

  @Expose()
  email: string;
}
