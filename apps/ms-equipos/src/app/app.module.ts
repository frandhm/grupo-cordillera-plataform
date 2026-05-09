import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; // <-- Importamos ConfigModule
import { EquipoEntity } from './equipo.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // 1. Inicializamos el lector de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true, // Hace que las variables estén disponibles en todo el microservicio
    }),

    // 2. Usamos process.env para leer el archivo .env
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10), // Convertimos el puerto a número
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [EquipoEntity],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([EquipoEntity]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }