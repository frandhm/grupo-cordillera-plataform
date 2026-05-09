import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EquipoEntity } from './equipo.entity';
import { AppController } from './app.controller'; // <--- Importamos el controlador
import { AppService } from './app.service';       // <--- Importamos el servicio

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'user_equipos',
      password: 'password_equipos',
      database: 'db_equipos',
      entities: [EquipoEntity],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([EquipoEntity]),
  ],
  controllers: [AppController], // <--- Registramos el controlador
  providers: [AppService],      // <--- Registramos el servicio
})
export class AppModule { }