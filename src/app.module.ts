import {
  FactoryProvider,
  MiddlewareConsumer,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { User } from './users/user.entity';
import { Report } from './reports/report.entity';
import { APP_PIPE } from '@nestjs/core';
import cookieSession from 'cookie-session';
import { ConfigModule, ConfigService } from '@nestjs/config';

const typeOrmConfig = {
  inject: [ConfigService],
  useFactory: async (config: ConfigService) => {
    return {
      type: 'sqlite',
      database: config.get<string>('DB_NAME'),
      // вносит автоматические изменения в базу данных
      synchronize: true,
      //сущности, которые мы хотим хранить в бд
      entities: [User, Report],
    } as TypeOrmModuleOptions;
  },
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    // TypeOrmModule.forRoot({
    //   type: 'sqlite',
    //   database: process.env.DB_NAME,
    //   //сущности, которые мы хотим хранить в бд
    //   entities: [User, Report],
    //   // вносит автоматические изменения в базу данных
    //   synchronize: true,
    // }),
    UsersModule,
    ReportsModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        // в тело запроса, попадают только свойства, которые мы ожидаем в DTO
        whitelist: true,
      }),
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // устанавливаем мидлвару, которая будет срабатывать на весь входящий трафик по всем эндпоинтам
    consumer
      .apply(
        cookieSession({
          keys: ['sometext'],
        }),
      )
      .forRoutes('*');
  }
}
