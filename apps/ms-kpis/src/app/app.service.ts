import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KpiEntity } from './kpi.entity';

@Injectable()
export class AppService {
  // Aquí "inyectamos" el repositorio que nos permite hablar con Postgres
  constructor(
    @InjectRepository(KpiEntity)
    private readonly kpiRepository: Repository<KpiEntity>,
  ) { }

  async crearKpi(datos: any): Promise<KpiEntity> {
    try {
      // Intentamos guardar directamente los datos
      return await this.kpiRepository.save(datos);
    } catch (error) {
      console.error("Error detallado:", error);
      throw error;
    }
  }

  async obtenerTodos(): Promise<KpiEntity[]> {
    return await this.kpiRepository.find(); // Trae todo lo que hay en la tabla
  }
}