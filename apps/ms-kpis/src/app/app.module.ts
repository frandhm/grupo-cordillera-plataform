import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService  } from '@nestjs/config';
import { KpiEntity } from './kpi.entity'; // Importa tu entidad

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Esta es la pieza clave: conecta NestJS con el Postgres que creamos en Docker
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
        entities: [KpiEntity],
        synchronize: true,
      }),
    }),
    // Registramos la entidad para que pueda ser usada por los repositorios
    TypeOrmModule.forFeature([KpiEntity]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }