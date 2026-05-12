import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { KpiEntity } from './kpi.entity'; // Importa tu entidad

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Esta es la pieza clave: conecta NestJS con el Postgres que creamos en Docker
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_KPIS_HOST,
      port: parseInt(process.env.DB_KPIS_PORT, 10),
      username: process.env.DB_KPIS_USER,
      password: process.env.DB_KPIS_PASSWORD,
      database: process.env.DB_KPIS_NAME,
      entities: [KpiEntity],
      synchronize: true,
    }),
    // Registramos la entidad para que pueda ser usada por los repositorios
    TypeOrmModule.forFeature([KpiEntity]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }