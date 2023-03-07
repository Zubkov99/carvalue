import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { plainToClass } from 'class-transformer';

// пропишем, что передавать в декоратор можно только классы
interface ClassConstructor {
  new (...args: any[]): {}
}

export function Serialize(dto: ClassConstructor) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor implements NestInterceptor {
  //принимаем dto и на основе их типа определяем, что нам отдавать наружу
  constructor(private dto: any) {}
  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    // сделать что-то, до того как запрос успел обработаться, пишем тут
    return handler.handle().pipe(
      map((data: any) => {
        // сделать что-то, до того, как запрос успел отправится наружу
        return plainToClass(this.dto, data, {
          // указываем, что хотим вернуть наружу только те свойства, которые имеют декоратор Expose
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
