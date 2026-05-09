import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config'; // <-- Añadimos ConfigService
import { EquipoEntity } from './equipo.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Cambiamos forRoot por forRootAsync
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService], // Inyectamos el servicio que lee el .env
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_EQUIPOS_HOST'),
        port: configService.get<number>('DB_EQUIPOS_PORT'),
        username: configService.get<string>('DB_EQUIPOS_USER'),
        password: configService.get<string>('DB_EQUIPOS_PASSWORD'),
        database: configService.get<string>('DB_EQUIPOS_NAME'),
        entities: [EquipoEntity],
        synchronize: true,
      }),
    }),

    TypeOrmModule.forFeature([EquipoEntity]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }