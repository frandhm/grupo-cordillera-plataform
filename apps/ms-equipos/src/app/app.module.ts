import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config'; // <-- Añadimos ConfigService
import { EquipoEntity } from './equipo.entity';
import { AreaEntity } from './area.entity';
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
        host: configService.get<string>('DB_EQUIPOS_HOST'),
        port: configService.get<number>('DB_EQUIPOS_PORT'),
        username: configService.get<string>('DB_EQUIPOS_USER'),
        password: configService.get<string>('DB_EQUIPOS_PASSWORD'),
        database: configService.get<string>('DB_EQUIPOS_NAME'),
        entities: [EquipoEntity, AreaEntity],
        synchronize: true,
      }),
    }),

    TypeOrmModule.forFeature([EquipoEntity, AreaEntity]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }