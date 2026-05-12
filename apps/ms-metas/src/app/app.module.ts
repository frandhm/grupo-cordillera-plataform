// apps/ms-metas/src/app/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MetaEntity } from './meta.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_METAS_HOST'),
        port: configService.get<number>('DB_METAS_PORT'),
        username: configService.get<string>('DB_METAS_USER'),
        password: configService.get<string>('DB_METAS_PASSWORD'),
        database: configService.get<string>('DB_METAS_NAME'), // = 'db_metas' ✓
        entities: [MetaEntity],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([MetaEntity]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}