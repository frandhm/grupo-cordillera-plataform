import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KpiEntity } from './kpi.entity'; // Importa tu entidad

@Module({
  imports: [
    // Esta es la pieza clave: conecta NestJS con el Postgres que creamos en Docker
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'user_cordillera',
      password: 'password123',
      database: 'kpis_db',
      entities: [KpiEntity], // Registramos la entidad aquí
      synchronize: true, // Esto crea las tablas automáticamente al iniciar (solo para desarrollo)
    }),
    // Registramos la entidad para que pueda ser usada por los repositorios
    TypeOrmModule.forFeature([KpiEntity]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }