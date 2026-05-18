import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KpiEntity } from './kpi.entity';
import { MedicionEntity } from './medicion.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_KPIS_HOST'),
        port: configService.get<number>('DB_KPIS_PORT'),
        username: configService.get<string>('DB_KPIS_USER'),
        password: configService.get<string>('DB_KPIS_PASSWORD'),
        database: configService.get<string>('DB_KPIS_NAME'),
        entities: [KpiEntity, MedicionEntity],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([KpiEntity, MedicionEntity]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }